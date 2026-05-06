# Instrukcja uruchomienia projektu Wilkołaki Solo

## Wymagania wstępne
Przed rozpoczęciem upewnij się, że masz zainstalowane:
- **Node.js** (wersja 18 lub nowsza): https://nodejs.org/
- **npm** (jest instalowane automatycznie z Node.js)

## Krok 1: Otwórz terminal w folderze projektu
Otwórz PowerShell lub CMD w lokalizacji: `C:\Users\barte\Desktop\Werewolf Solo`

## Krok 2: Zainstaluj zależności
Uruchom w terminalu:
```bash
npm install
```

To polecenie pobierze i zainstaluje wszystkie wymagane biblioteki (React Native, Expo, TypeScript, itp.)

## Krok 3: Uruchom projekt
```bash
npm start
```

## Krok 4: Zobacz aplikację na telefonie lub w przeglądarce

### Opcja A: Na telefonie (Android/iOS)
1. Zainstaluj aplikację **Expo Go** ze sklepu:
   - Android: Google Play Store
   - iOS: App Store
2. Zeskanuj kod QR wyświetlony w terminalu aplikacją Expo Go
3. Aplikacja się uruchomi!

### Opcja B: W przeglądarce (Web)
1. Po uruchomieniu `npm start` naciśnij klawisz `w` w terminalu
2. Aplikacja otworzy się w przeglądarce automatycznie

### Opcja C: Na emulatorze (zaawansowane)
- **Android**: Naciśnij `a` w terminalu (wymaga Android Studio)
- **iOS**: Naciśnij `i` w terminalu (tylko macOS, wymaga Xcode)

## Rozwiązywanie problemów

### Problem: "Cannot find module 'react'"
**Rozwiązanie:** Uruchom ponownie `npm install`

### Problem: Kod QR nie działa
**Rozwiązanie:** Upewnij się, że telefon i komputer są w tej samej sieci Wi-Fi

### Problem: Metro bundler nie startuje
**Rozwiązanie:** 
```bash
npm start -- --reset-cache
```

### Problem: Błędy TypeScript
**Rozwiązanie:** To normalne na początku. Jeśli aplikacja działa, możesz je zignorować.

## Przydatne komendy

### Restart Metro Bundler
```bash
npm start -- --clear
```

### Tylko web
```bash
npm run web
```

### Sprawdź wersję Node.js
```bash
node --version
```

Powinna być 18.x lub nowsza.

## Po pierwszym uruchomieniu
Jeśli wszystko działa:
1. Zobacz grę w akcji
2. Przetestuj różne poziomy trudności
3. Sprawdź logikę dedukcji
4. Modyfikuj kod według potrzeb

## Wsparcie
Jeśli masz problemy:
1. Sprawdź dokumentację Expo: https://docs.expo.dev/
2. Sprawdź że wszystkie wymagania są spełnione
3. Upewnij się, że Node.js i npm są poprawnie zainstalowane
