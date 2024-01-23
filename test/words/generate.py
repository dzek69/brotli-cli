import random
import string

def generate_random_word():
    word_length = random.randint(3, 10)  # You can adjust the word length as needed
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(word_length))

def generate_file(file_number, num_words):
    file_name = f"{file_number}.txt"
    words = [generate_random_word() for _ in range(num_words)]

    with open(file_name, 'w') as file:
        file.write(" ".join(words))

if __name__ == "__main__":
    num_files = 1000
    words_per_file = 500

    for i in range(1, num_files + 1):
        generate_file(i, words_per_file)
