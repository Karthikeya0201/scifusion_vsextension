# Method 1: Using a loop

print("Method 1: Using a loop")
for i in range(1, 101):  # range(1, 101) generates numbers from 1 up to (but not including) 101
    print(i)


# Method 2: Using while loop

print("\nMethod 2: Using a while loop")
number = 1
while number <= 100:
    print(number)
    number += 1


# Method 3: Using list comprehension and unpacking (more concise)

print("\nMethod 3: Using list comprehension and unpacking")
print(*[i for i in range(1, 101)])  # List comprehension creates a list, '*' unpacks it for printing
# or, even more concisely
print("\nMethod 4: Using range and unpacking directly")
print(*range(1, 101))


# Method 5: Using `join` (to get all numbers on one line, space-separated)
print("\nMethod 5: Using join (one line output)")
print(" ".join(map(str, range(1, 101))))