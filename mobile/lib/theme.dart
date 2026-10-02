import 'package:flutter/material.dart';

// Matches the web app's dark look and indigo brand gradient.
const brand = Color(0xFF6D5EF8);
const brandAlt = Color(0xFF9B6BFF);
const surface = Color(0xFF12131A);
const card = Color(0xFF1B1D27);

ThemeData buildTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: brand,
    brightness: Brightness.dark,
    surface: surface,
  );

  return ThemeData(
    colorScheme: scheme,
    scaffoldBackgroundColor: surface,
    useMaterial3: true,
    cardTheme: const CardThemeData(
      color: card,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(14)),
      ),
    ),
    inputDecorationTheme: const InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(10)),
      ),
      filled: true,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: brand,
        minimumSize: const Size.fromHeight(48),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
    ),
  );
}
