from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

driver = webdriver.Chrome()

driver.get('http://localhost:3000/movies')

time.sleep(1)
login_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.CLASS_NAME, 'login-btn'))
)
login_button.click()
time.sleep(1)

register_link = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.ID, 'register'))
)
register_link.click()
time.sleep(1)

# Registration form

# change
firstname_input = driver.find_element(By.NAME, "firstName")
firstname_input.send_keys('ayon')
time.sleep(1)

# change
lastname_input = driver.find_element(By.NAME, "lastName")
lastname_input.send_keys('asad')
time.sleep(1)

# Error
email_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
)
email_input.send_keys('admin')
time.sleep(1)
submit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
)
submit_button.click()
time.sleep(1)

# change
email_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
)
email_input.send_keys('2@gmail.com')
time.sleep(1)

# Error
address_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@name='address']"))
)
address_input.send_keys('')
time.sleep(1)
submit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
)
submit_button.click()
time.sleep(1)

address_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@name='address']"))
)
address_input.send_keys('Dhaka')
time.sleep(1)

password_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@type='password']"))
)
password_input.send_keys('1234admin')
time.sleep(1)

# Error
confirm_password_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@name='confirm_password']"))
)
confirm_password_input.send_keys('')
time.sleep(1)
submit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
)
submit_button.click()
time.sleep(1)

confirm_password_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@name='confirm_password']"))
)
confirm_password_input.send_keys('1234admin')
time.sleep(1)

submit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
)
submit_button.click()
time.sleep(1)

login_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.CLASS_NAME, 'login-btn'))
)
login_button.click()
time.sleep(1)

# change
email_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
)
email_input.send_keys('admin2@gmail.com')

time.sleep(1)

# Error
password_input = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//input[@type='password']"))
)
password_input.send_keys('')
time.sleep(1)
submit_button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
)
submit_button.click()

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

time.sleep(10)
