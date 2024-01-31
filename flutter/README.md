# Flutter Training

## Module 1: Install

iOS cannot be run on Windows and is completely optional on Mac.

### Install Git.

https://github.com/git-guides/install-git

### Install Flutter for your platform. 

Use VS Code to install. (The Dart runtime is included.)

https://docs.flutter.dev/get-started/install

### Prep Install for Android or iOS Emulator

Windows/Mac - Android Studio

https://developer.android.com/studio

Mac - iOS, XCode (use App Store)

https://apps.apple.com/us/app/xcode/id497799835 

### Install Emulator

Android

https://developer.android.com/studio/run/emulator

iOS

https://developer.apple.com/documentation/xcode/installing-additional-simulator-runtimes

### Install Flutter/Dart VS Code Extension

> "It depends on (and will automatically install) the Dart extension for support for the Dart programming language."

https://marketplace.visualstudio.com/items?itemName=Dart-Code.flutter

## Module 2: Dart

### Create a Dart Project

https://dart.dev/tools/dart-create

### Run a Dart Project

https://dart.dev/tools/dart-run

### Fix a Dart Project

The VS Code extension can do this for us.

https://dart.dev/tools/dart-fix

### Assessment

Build a CLI flash card application. 

The user is given a series of questions which they must answer. Track correct and incorrect answers. At the end, report correct answers, incorrect answers, total questions, and correct/incorrect percentage.

Three options:
1. Add an answer as free form text. If the user answers the question as text precisely, count it as a correct answer.
2. Multiple choice: give the user several options. One (or more?) may be correct. If the user selects the correct option, count it as a correct answer.
3. Both free form text and multiple choice.

#### Example UI

**Welcome**

```
Welcome to Flash App!
=====================

Enter your name: Dori

Hello, Dori! Let's get started.
```

**Multiple choice**

```
Which Plantagenet king was known for his role in the signing of the Magna Carta in 1215?
A) Henry II
B) Richard I
C) John
D) Edward I

Dori: C

That's correct!
```

```
What are valence electrons?

A) Electrons that are involved in forming bonds.
B) Electrons that are found in the nucleus of an atom.
C) Electrons that are always negatively charged.
D) Electrons that can only be found in metals.

Dori: C

That's not quite right.
```

Correct answer is A.

**Free text**

```
Kondiaronk, a notable Wendat (Huron) chief and orator, 
played a pivotal role in the late 17th century in North America. 
He is best known for his skepticism of European religions 
and his influential role in which significant historical event 
that reshaped the balance of power in the Great Lakes region?

Dori: The Great Peace of Montreal

That's correct!
```

**Report**

```
Dori, you have:
=======================
   15 Correct Answers
    2 Incorrect Answers
   17 Total Questions
88.2% Correct
11.8% Incorrect

Well done!

Play again? [y/n]: y
```

#### Technical Requirements

- Use sensible classes and methods.
- Store questions in memory (class and `List<T>`).
- Write command-line apps: https://dart.dev/tutorials/server/cmdline

#### Flexibility

Obviously, you can use any questions and answers as you see fit. Get creative.

**Possible Challenges**

- Load a bunch of questions in memory and randomly select 10 questions.
- Or ask the user to select the number.
- Create question "categories": pop culture, sitcoms, aerospace, music, horror movies... The user selects a category and follows through with questions.
- Ask the user to play again.

## Module 3: Flutter Basics

Get as much of this course done as you can in four days. It can be a bit mind-numbing. Take breaks. Refresh. Try to be as productive as you can. Huntington is counting on us.

https://dev10.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/

## Module 4: BLOC, Testing, Clean Architecture
