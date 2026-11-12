# QısaGet Firestore & Storage Təhlükəsizlik Spesifikasiyası

## 1. Data Invariants (Verilənlər İnvariantları)
1. **Unikal və Qorunan İstifadəçi Adı:** `profiles/{username}` sənəd ID-si yalnız `^[a-z0-9.-]{3,24}$` formatında ola bilər və `admin`, `login`, `giris`, `api`, `qeydiyyat`, `mexfilik`, `privacy`, `terms`, `sertler`, `about`, `haqqinda`, `support`, `destek`, `qisaget`, `root`, `system`, `auth`, `settings`, `logout`, `cixis`, `404`, `profile`, `profiles`, `user`, `users`, `test` kimi qorunan sözlər ola bilməz.
2. **Atomik Sahiblik Bağlantısı:** Hər `profiles/{username}` yaradılarkən eyni əməliyyatda (batch) `users/{uid}` sənədi yaradılır və ya yenilənir (`getAfter` yoxlaması ilə).
3. **Dəyişməz Sahələr (Immortal Fields):** `ownerUid`, `username`, və `createdAt` yaradıldıqdan sonra yenilənə bilməz.
4. **PII İzolyasiyası:** `users/{uid}` sənədində saxlanılan `email` yalnız sənəd sahibi (`request.auth.uid == uid`) və ya təsdiqlənmiş platforma admini tərəfindən oxuna bilər. Açıq `list` sorğuları qadağandır.
5. **Təsdiq Nişanı Qorunması:** `verified` sahəsini adi istifadəçilər öz profillərində `true` edə və ya dəyişə bilməzlər; yalnız təsdiqlənmiş platforma admini idarə edə bilər.
6. **Zərərli URL və Ölçü Limiti:** `avatar` sahəsi `data:` / `javascript:` sxemlərini rədd edir; siyahılar (`links` ≤ 50, `products` ≤ 50, `music` ≤ 30, `news` ≤ 20) sərt ölçü limiti ilə qorunur.
7. **Server Zamanı:** `createdAt` və `updatedAt` mütləq `request.time` olmalıdır.

## 2. The "Dirty Dozen" Red Team Test Payloads
1. **Shadow Field Injection:** `{ ..., isSuperAdmin: true }` → `hasOnly()` ilə rədd edilməlidir.
2. **Self-Verification Escalation:** Adi istifadəçi `{ verified: true }` göndərir → Rədd edilməlidir.
3. **Identity Spoofing:** Başqa `ownerUid` ilə profil yaratma → `incoming().ownerUid == request.auth.uid` ilə rədd edilməlidir.
4. **Reserved Slug Hijack:** `/profiles/admin` və ya `/profiles/login` yaratma → `isValidUsername` ilə rədd edilməlidir.
5. **Unverified Token Write:** `email_verified: false` olan istifadəçi yazmağa çalışır → Rədd edilməlidir.
6. **Email Spoofing Attack:** `email: "qisaget.na@gmail.com"`, amma `email_verified: false` → `isAdmin()` rədd etməlidir.
7. **Cross-Tenant Overwrite:** B istifadəçisi A-nın `/profiles/na.mexman` sənədini yeniləməyə çalışır → Rədd edilməlidir.
8. **XSS / Base64 Avatar Poisoning:** `avatar: "javascript:alert(1)"` və ya 2MB `data:image/...` → URL regex və `.size()` ilə rədd edilməlidir.
9. **Array Bombing (Denial of Wallet):** `links` siyahısına 51+ element və ya 50KB mətn → `.size() <= 50` ilə rədd edilməlidir.
10. **PII Blanket Read:** B istifadəçisi `/users/A_UID` oxumağa və ya `/users` kolleksiyasını listələməyə çalışır → Rədd edilməlidir.
11. **Timestamp Forgery:** Keçmiş və ya gələcək `createdAt` / `updatedAt` → `request.time` yoxlaması ilə rədd edilməlidir.
12. **Orphaned Profile Without User Link:** `users/{uid}` olmadan `profiles/{username}` yaratma → `getAfter` atomiklik qaydası ilə rədd edilməlidir.

## 3. Red Team Audit Yoxlama Nəticələri
- **Identity Spoofing:** Bağlanıb (`ownerUid == request.auth.uid` yaradılışda, `incoming().ownerUid == existing().ownerUid` yeniləmədə).
- **Shadow Update / Self-Verified:** Bağlanıb (`hasOnly` bütün sahələri məhdudlaşdırır və qeyri-adminlər üçün `verified` qadağandır).
- **Email Spoofing:** Bağlanıb (`isVerifiedUser()` `email_verified == true` tələb edir).
- **PII Leak:** Bağlanıb (`users/{uid}` yalnız sahib və admin üçün oxunur).
- **Open List Scraping:** Bağlanıb (`profiles` `list` yalnız `resource.data.ownerUid == request.auth.uid || isAdmin()` üçün açıqdır).
