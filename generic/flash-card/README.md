### CLI Flash Card

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

#### Flexibility

Obviously, you can use any questions and answers as you see fit. Get creative.

**Possible Challenges**

- Load a bunch of questions in memory and randomly select 10 questions.
- Or ask the user to select the number.
- Create question "categories": pop culture, sitcoms, aerospace, music, horror movies... The user selects a category and follows through with questions.
- Ask the user to play again.