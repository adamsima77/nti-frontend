# Študent: Tímy Feature - Dokumentácia

## ✅ Implementované

### Stránky
- **`/timy`** - Zoznam všetkých tímov používateľa
- **`/timy/[id]`** - Detail tímu s členmi a aplikáciami
- **`/timy/vytvorit`** - Formulár na vytvorenie nového tímu

### Komponenty
- **`TeamInviteModal.vue`** - Modal na pozvanie nových članov

### Store (Pinia)
- **`useTeamsStore`** - Komplentní state management pre tímy
  - `fetchTeams()` - GET /teams
  - `fetchTeamById(id)` - GET /teams/{id}
  - `createTeam(data)` - POST /teams
  - `updateTeam(id, data)` - PUT /teams/{id}
  - `deleteTeam(id)` - DELETE /teams/{id}
  - `inviteMember(teamId, data)` - POST /teams/{id}/invite
  - `removeMember(teamId, memberId)` - DELETE /teams/{id}/members/{memberId}
  - `updateMemberRole(teamId, memberId, role)` - PATCH /teams/{id}/members/{memberId}

## 🔌 API Endpoints (Očakávané)

### GET /api/teams
Vracia zoznam všetkých tímov užívateľa

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "GreenTech tím",
      "description": "...",
      "myRole": "Team Lead",
      "createdAt": "2025-12-01",
      "members": [
        { "id": 1, "name": "Ján Novák", "email": "jan@example.com", "role": "Team Lead" }
      ],
      "applications": [
        { "id": 1, "title": "...", "status": "approved", "program": "Program A" }
      ]
    }
  ]
}
```

### POST /api/teams
Vytvorí nový tím

**Request:**
```json
{
  "name": "Nový tím",
  "description": "Popis...",
  "members": ["member1@example.com", "member2@example.com"]
}
```

### POST /api/teams/{id}/invite
Pozve člena do tímu

**Request:**
```json
{
  "email": "novyclen@example.com",
  "role": "Developer"
}
```

### DELETE /api/teams/{id}/members/{memberId}
Odstráni člena z tímu

## 🎨 UI Flow

### 1. Zoznam tímov (/timy)
- Zobrazuje karty všetkých tímov
- Tlačidlo "Vytvoriť tím"
- Kliknutím na kartu → Detail tímu

### 2. Vytvorenie tímu (/timy/vytvorit)
1. Vyplní názov + popis
2. Pridá členov (email + role)
3. Klikne "Vytvoriť tím"
4. Presmeruje na detail nového tímu

### 3. Detail tímu (/timy/[id])
- Header s info
- Tabuľka členov s možnosťou odstrániť (pre Team Lead)
- Tabuľka aplikácií tímu
- Info karta (dátumy, počty)
- Tlačidlá: Pozvať člena, Nová prihláška

### 4. Pozvanie člena
- Klikoň "Pozvať" → Modal
- Email + Rola
- Backend pošle pozvánku

## 🔐 Permissions

- **Všetci študenti:** Viď svoje tímy
- **Team Lead:** Môže odstrániť členov, pozvať nových
- **Všetci v tíme:** Vidí aplikácie tímu

## 📝 Middleware

- Všetky tímové stránky vyžadujú `auth` middleware
- `useApi` automaticky include auth token do requestov

## 💡 Poznámky pre Backend

1. **Team creation** - Tvorca by mal byť automaticky "Team Lead"
2. **Invitations** - Backend by mal odoslať email s pozvánkou
3. **Unique members** - Nemožno pridať člena dvakrát
4. **Role-based** - Team Lead môže meniť role alebo odstraňovať členov
5. **Cascading delete** - Vymazanie tímu by malo vymazať aj team_user záznamy

## 🧪 Testing

### Happy Path:
1. Uživateľ sa prihlási
2. Choď do `/timy`
3. Klikni "Vytvoriť tím"
4. Vyplň formulár (min. názov)
5. Klikni "Vytvoriť tím"
6. Vidí detail nového tímu
7. Klikni "Pozvať člena"
8. Vyplň email + rola
9. Klikni "Poslať pozvánku"
10. Vidí člena v tabuľke

### Error Cases:
- Neplatný email pri pozvaní
- Duplicate email pri pride člena
- Tím nenájdený (404)
- Network errors → Toast s chybou

## 🚀 Next Steps

1. **Backend API** - Implementovať endpointy
2. **Email notifications** - Odoslanie pozván
3. **Team deletion** - Soft delete alebo hard delete?
4. **Bulk actions** - Remove multiple members?
5. **Search & filter** - Na /timy zozname?
