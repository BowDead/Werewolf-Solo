# Wilkołaki Solo 🐺

## Informacje o projekcie
**Przedmiot:** Zaawansowane Programowanie Systemów Mobilnych  
**Etap:** II – Implementacja projektu  

**Autor:**  
Bartłomiej Gwóźdź – 37685  

## Opis projektu
Projekt z przedmiotu **Zaawansowane Programowanie Systemów Mobilnych**, pod tytułem **„Wilkołaki Solo"**, zakłada stworzenie krótkiej, powtarzalnej oraz nieskomplikowanej mobilnej gry jednoosobowej opartej na mechanice **dedukcji socjalnej**.

Gracz wciela się w obserwatora analizującego wypowiedzi postaci niezależnych (NPC). Na podstawie ich dialogów oraz wykrywania niespójności w wypowiedziach gracz musi ustalić, które postacie są wilkołakami.

## Mechanika gry
Rozgrywka polega na:
- analizowaniu wypowiedzi mieszkańców wioski (Kowal, Piekarz, Wójt, itp.),
- wykrywaniu sprzeczności w ich wypowiedziach,
- wykorzystaniu faktu, że wilkołaki ZAWSZE kłamią, a wieśniacy ZAWSZE mówią prawdę,
- podejmowaniu decyzji, które postacie są wilkołakami.

Każdy mieszkaniec ma swoją rolę zawodową i wypowiada się w kontekście pracy w wiosce.
Kluczem do wygranej jest znalezienie sprzeczności - jeśli dwie osoby mówią przeciwne rzeczy 
o tej samej osobie, jedna z nich MUSI być wilkołakiem.

## Zaimplementowane funkcjonalności
✅ **3 poziomy trudności:**
- Łatwy: 5 postaci, 1 wilkołak, 2 błędy
- Średni: 7 postaci, 2 wilkołaki, 1 błąd
- Trudny: 9 postaci, 3 wilkołaki, 1 błąd

✅ **System dedukcji:**
- Losowo generowane scenariusze
- Role zawodowe mieszkańców (Kowal, Piekarz, Wójt, itp.)
- Wypowiedzi związane z rolami zawodowymi
- Wilkołaki ZAWSZE kłamią, wieśniacy ZAWSZE mówią prawdę
- Podpowiedzi dla gracza

✅ **Interfejs użytkownika:**
- Intuicyjny interfejs mobilny
- System oskarżeń
- Statystyki gry
- Ekran podsumowania z rozwiązaniem

## Cel gry
Celem gracza jest **poprawne wydedukowanie wszystkich postaci będących wilkołakami**, popełniając przy tym **jak najmniejszą liczbę błędów**.

## Technologie
- **React Native** - framework mobilny
- **Expo** - narzędzie developerskie
- **TypeScript** - typowanie statyczne

## Instalacja i uruchomienie

### Wymagania
- Node.js (wersja 18 lub nowsza)
- npm lub yarn
- Expo Go (aplikacja mobilna) - do testowania na telefonie

### Krok 1: Instalacja zależności
```bash
npm install
```

### Krok 2: Uruchomienie aplikacji
```bash
npm start
```

Po uruchomieniu skanuj QR kod aplikacją Expo Go na telefonie, lub użyj emulatora:
- Android: `npm run android`
- iOS: `npm run ios` (tylko macOS)
- Web: `npm run web`

## Struktura projektu
```
Werewolf Solo/
├── App.tsx              # Główny komponent z UI i logiką gry
├── types.ts             # Definicje typów TypeScript
├── gameLogic.ts         # Logika generowania gry i scenariuszy
├── package.json         # Zależności projektu
├── app.json            # Konfiguracja Expo
├── tsconfig.json       # Konfiguracja TypeScript
└── assets/             # Zasoby (ikony, obrazy)
```

## Zasady gry

### Jak grać?
1. Wybierz poziom trudności
2. Przeczytaj wszystkie wypowiedzi postaci
3. Szukaj sprzeczności i podejrzanych zachowań
4. Kliknij na postać, aby ją oskarżyć
5. Znajdź wszystkich wilkołaków przed przekroczeniem limitu błędów

### Logika wypowiedzi
- **Wieśniacy ZAWSZE mówią prawdę (100%)**:
  - Mówią prawdę o innych wieśniakach (chwalą ich)
  - Mówią prawdę o wilkołakach (oskarżają ich)
- **Wilkołaki ZAWSZE kłamią (100%)**:
  - Kłamią o wieśniakach (fałszywie oskarżają niewinnych)
  - Kłamią o wilkołakach (fałszywie bronią swoich)

### Przykład dedukcji
Jeśli Kowal mówi: "Piekarz sabotuje pracę innych"
I Leśniczy mówi: "Piekarz uczciwie wykonuje swoją pracę"
- Jedna z tych osób kłamie (jest wilkołakiem)
- Musisz znaleźć więcej sprzeczności, aby wydedukować kto

### Strategie
- Zwróć uwagę na sprzeczne wypowiedzi o tej samej osobie
- Postać często oskarżana może być niewinna (lub wilkołakiem!)
- Postać często broniona może być wilkołakiem chroniony przez stado
- Używaj podpowiedzi, gdy potrzebujesz wskazówek

## Możliwe rozszerzenia
W przyszłości projekt może zostać rozszerzony o:
- ✅ większą liczbę postaci i ról
- ✅ różne poziomy trudności
- ✅ system punktacji
- ✅ losowe generowanie scenariuszy
- 🔄 dodatkowe role (np. Widzący, Ochroniarz)
- 🔄 tryb wielorundowy
- 🔄 system osiągnięć
- 🔄 ranking graczy

## Status projektu
Etap II – Implementacja zakończona ✅
