# Firebase Security Specification & Red Team Audit

## 1. Data Invariants
- **Zero-Trust Multi-User Isolation**: Every student's profile, mistakes, recordings, audio reports, and sessions belong strictly to their `userId` matching `request.auth.uid`.
- **No Cross-User Access**: User A (`auth.uid == 'user_a'`) is strictly forbidden from reading, listing, modifying, or deleting any data in `/users/user_b/**`.
- **ID Hardening**: All path parameters (`userId`, `mistakeId`, `sessionId`, `reportId`) must strictly match `^[a-zA-Z0-9_-]+$` and have length `<= 128`.
- **Input Boundary Protection**: String fields have strictly enforced `size() <= max` to prevent Denial-of-Wallet and buffer exploitation attacks.
- **Connection Test Verification**: Document `/test/connection` is strictly read-only for client boot verification.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Payload 1 (Identity Theft)**: An attacker authenticated as `user_attacker` submits a write to `/users/victim_user` attempting to rewrite victim's mastery score.
2. **Payload 2 (Ghost Field Injection / Shadow Update)**: Writing `{ id: "...", role: "admin", backdoor: true }` attempting privilege escalation.
3. **Payload 3 (Buffer Bomb / Resource Poisoning)**: Submitting a 5MB string in `wordArabic` or `detectedPronunciation` to crash clients or trigger denial-of-wallet.
4. **Payload 4 (Path Traversal / ID Poisoning)**: Attempting to target document ID `../other_user` or special characters.
5. **Payload 5 (Unauthenticated Write)**: Direct write by an unauthenticated client (`request.auth == null`) to `/users/{userId}`.
6. **Payload 6 (Cross-User Subcollection Creation)**: `user_attacker` posting a fake mistake to `/users/victim_user/mistakes/{mistakeId}`.
7. **Payload 7 (Unbounded Array Injection)**: Injecting large arrays to cause memory spikes.
8. **Payload 8 (Type Spoofing)**: Submitting numeric strings `"142"` instead of numbers for `totalMemorizedAyahs`.
9. **Payload 9 (Query Snooping / Blanket Read)**: Attempting to query `collectionGroup('mistakes')` or list all users' documents without matching owner ID.
10. **Payload 10 (Delete Victim Session)**: Sending a `DELETE` request to `/users/victim_user/sessions/{sessionId}` from an external session.
11. **Payload 11 (Tampered Report Injection)**: Submitting a fake report claiming 100% match with invalid metadata.
12. **Payload 12 (Test Collection Overwrite)**: Attempting a `write` operation to `/test/connection` which must be read-only.
