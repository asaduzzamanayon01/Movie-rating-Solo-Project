from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import random
import string
import os
import selenium
import time

driver = webdriver.Chrome()

driver.get('http://localhost:3000/movies')


# Helper function to generate random strings for movie title, description
def generate_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for _ in range(length))

# Auto-generate random movie data
movie_title = "Movie " + generate_random_string(6).capitalize()
description = "This is a test movie description for " + movie_title
release_date = "15/05/2023"

# Define the path to an image to upload (you'll need an image in this path)
image_path = os.path.join(os.getcwd(), 'images.jpeg')  # Adjust the image path

time.sleep(1)
login_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.CLASS_NAME, 'login-btn'))
)
login_button.click()

time.sleep(1)

# Error
email_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
)
email_input.send_keys('ayon@gmail')
time.sleep(1)
submit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
)
submit_button.click()

time.sleep(1)

email_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
)
email_input.send_keys('.com')
time.sleep(1)

password_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@type='password']"))
)
password_input.send_keys('1234admin')

time.sleep(1)

submit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
)
submit_button.click()

time.sleep(1)

ham_btn = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.CLASS_NAME, 'ham-menu'))
)
ham_btn.click()
time.sleep(1)

create_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.CLASS_NAME, 'create-movie'))
)
create_button.click()
time.sleep(1)

ham_btn = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.CLASS_NAME, 'ham-menu'))
)
ham_btn.click()
time.sleep(1)

# Wait for the movie title field to load and fill in the form
WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.NAME, 'title'))
)

# Error
title = driver.find_element(By.XPATH, "//input[@name='title']")
title.send_keys()
time.sleep(1)
submit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
)
submit_button.click()

title = driver.find_element(By.XPATH, "//input[@name='title']")
title.send_keys(movie_title)
time.sleep(1)
desc = driver.find_element(By.NAME, 'description')
desc.send_keys(description)
time.sleep(1)
release = driver.find_element(By.NAME, 'releaseDate')
release.send_keys(release_date)
time.sleep(1)

# Upload an image
file_input = driver.find_element(By.NAME, 'image')
file_input.send_keys(image_path)
time.sleep(1)

# Error
submit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
)
submit_button.click()
time.sleep(1)

select_genre = driver.find_element(By.CLASS_NAME, "genre")
select_genre.click()
time.sleep(1)

genre_btn = driver.find_element(By.ID, "group-D")
genre_btn.click()
time.sleep(1)

select_genre = driver.find_element(By.CLASS_NAME, "genre")
select_genre.click()
time.sleep(1)

submit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
)
submit_button.click()

# Allow time for the movie to be created
time.sleep(3)

# Print confirmation
print(f"Movie '{movie_title}' created with description '{description}'.")

# Reload the page
# driver.refresh()
# Allow time for the page to reload
time.sleep(2)

second_movie = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, ".movies-list > div:nth-child(1)"))
)
second_movie.click()
time.sleep(2)

# # Find all the stars with the class 'rr--box'
# stars = driver.find_elements(By.CSS_SELECTOR, '.rr--box')

# # Ensure there are 5 stars and then click the 3rd star (index 2)
# stars[2].click()

# Find the textarea for comments
comment_box = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.CSS_SELECTOR, "textarea[placeholder='Add a comment...']"))
)
comment_box.send_keys("test comment")
time.sleep(1)

# Submit the comment
submit_comment_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
)
submit_comment_button.click()
time.sleep(1)

edit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[text()='Edit']"))
)
edit_button.click()
time.sleep(1)

# Find the textarea for comments
comment_box = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.CSS_SELECTOR, "textarea[placeholder='Add a comment...']"))
)
comment_box.send_keys("test comment")
time.sleep(1)

# Submit the comment
submit_comment_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
)
submit_comment_button.click()
time.sleep(2)

delete_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[text()='Delete']"))
)
delete_button.click()
time.sleep(1)

# Handle the custom alert dialog that appears after clicking the delete button
try:
    # Wait for the custom alert dialog to be visible
    alert_dialog = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//div[@role='alertdialog']"))
    )
    # Find and click the confirm button within the alert dialog
    confirm_button = alert_dialog.find_element(By.XPATH, ".//button[text()='Delete']")
    confirm_button.click()
    print("Alert dialog confirmed")

except selenium.common.exceptions.TimeoutException:
    print("Custom alert dialog not found")

time.sleep(1)

edit = driver.find_element(By.CSS_SELECTOR, ".edit")
edit.click()
time.sleep(1)

title = driver.find_element(By.XPATH, "//input[@name='title']")
title.send_keys("updated_title")
time.sleep(1)

desc = driver.find_element(By.NAME, 'description')
desc.send_keys("updated description")
time.sleep(1)

submit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
)
submit_button.click()

delete_movie = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.ID, "movie-delete"))
)
delete_movie.click()
time.sleep(1)

# Handle the custom alert dialog that appears after clicking the delete button
try:
    # Wait for the custom alert dialog to be visible
    alert_dialog = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//div[@role='alertdialog']"))
    )
    # Find and click the confirm button within the alert dialog
    confirm_button = alert_dialog.find_element(By.XPATH, ".//button[text()='Delete']")
    confirm_button.click()
    print("Alert dialog confirmed")

except selenium.common.exceptions.TimeoutException:
    print("Custom alert dialog not found")

time.sleep(1)

time.sleep(10)

driver.quit()
