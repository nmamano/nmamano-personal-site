# Negative Binary Search and Choir Rehearsal

One of the points we touch on on the upcoming book, Beyond Cracking the Coding Interview ([beyondctci.com](https://www.beyondctci.com/)), is that binary search has many interesting applications besides finding an element in a sorted array. I'll share an example based on a personal story that's a bit too niche for the book, but kind of fun.

A friend sings in a choir of 40-50 people, and they told me that, in the last rehearsal, the conductor could hear one person singing the wrong part but couldn't identify who. The conductor tried to isolate where the wrong part was coming from by basically **binary searching** the choir members, but there was an issue: when the conductor narrowed down the source to a small enough group, the issue disappeared. Whoever was singing the wrong part was only getting tripped up by hearing other people singing around them, but would sing their part perfectly in isolation. Eventually, the conductor gave up.

What should the conductor have done? More precisely, what algorithm should they have used to find the culprit? First, let's formalize the problem.

## The problem

You are given `n`, the number of singers, and a number `k < n/2`. You have `n` singers, say, singer `1` to singer `n`, and you can make any subset sing a song. This gives you 1 bit of information: whether they all sang it correctly or whether someone in that group messed up. All the singers always sing the right part except one, who sings the wrong part, but **only** if at least `k` people are singing with them. How do you find who it is?

## The solution

The key is to do a kind of "negative binary search," where you make everyone sing **except the subset you want to test.** You know the culprit is in a subset when everyone else sings correctly.

Example: imagine `n` is `100` and `k` is `30`.

Iteration 1:

- The culprit is in range 1-100.
- You split the range into 1-50 and 51-100.
- You want to check if the culprit is in 1-50, so you make everyone else (51-100) sing.
- Imagine they sing **correctly**. That means the culprit is in 1-50.

Iteration 2:

- The culprit is in range 1-50.
- You split the range into 1-25 and 26-50.
- You want to check if the culprit is in 1-25, so you make everyone else (26-100) sing.
- Imagine they sing **incorrectly.** That means the culprit is in 26-50.

Iteration 3:

- The culprit is in range 26-50.
- You split the range into 26-38 and 39-50.
- You want to check if the culprit is in 26-38, so you make everyone else (1-25 and 39-100) sing.
- Imagine they sing **correctly.** That means the culprit is in 26-38.

Iteration 4:

- The culprit is in range 26-38.
- You split the range into 26-31 and 32-38.
- You want to check if the culprit is in 26-31, so you make everyone else (1-25 and 32-100) sing.
- Imagine they sing **incorrectly.** That means the culprit is in 32-38.

And so on. In this way, the conductor could have found the culprit in `O(log n)` steps.

Credit to Timothy Johnson for the "negative binary search" idea, which I had never heard before.

PS. Let me know if you had seen this technique used before. Also, if you happen to be a choir conductor, I'd love to hear if (a) the problem is relatable, and (b) the algorithm may be useful to you.

![Choir](choir.png =40%x40%)
