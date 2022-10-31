"""
Provides some arithmetic functions
"""
import sys
from webdriver_manager.firefox import GeckoDriverManager
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options


def debugger_is_active() -> bool:
    """Return if the debugger is currently active"""
    return hasattr(sys, 'gettrace') and sys.gettrace() is not None


class TestStartASession():
    """
    Provides some arithmetic functions
    """

    def setup_method(self, method):
        """
        Provides some arithmetic functions
        """
        webdriverOptions = Options()
        webdriverOptions.headless = not debugger_is_active()
        self.driver = webdriver.Firefox(service=FirefoxService(
            GeckoDriverManager().install()), options=webdriverOptions)
        self.vars = {}

    def teardown_method(self, method):
        """
        Provides some arithmetic functions
        """
        self.driver.quit()

    def test_startasession(self):
        """
        Provides some arithmetic functions
        """
        self.driver.get("http://localhost:3000")
        self.driver.set_window_size(1911, 1158)
        WebDriverWait(self.driver, 30).until(
            expected_conditions.visibility_of_element_located((By.CSS_SELECTOR, ".ip > .value")))
        WebDriverWait(self.driver, 30).until(expected_conditions.visibility_of_element_located(
            (By.CSS_SELECTOR, ".country > .value")))
        self.vars["wanIp"] = self.driver.find_element(
            By.CSS_SELECTOR, ".ip > .value").text
        self.vars["country"] = self.driver.find_element(
            By.CSS_SELECTOR, ".country > .value").text
        self.vars["region"] = self.driver.find_element(
            By.CSS_SELECTOR, ".region > .value").text
        self.vars["city"] = self.driver.find_element(
            By.CSS_SELECTOR, ".city > .value").text
        self.driver.find_element(By.CSS_SELECTOR, ".username-input").click()
        self.vars["isp"] = self.driver.find_element(
            By.CSS_SELECTOR, ".isp > .value").text
        self.driver.find_element(By.CSS_SELECTOR, ".username-input").click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".username-input").send_keys("username")
        self.driver.find_element(By.CSS_SELECTOR, ".room-input").click()
        self.driver.find_element(
            By.CSS_SELECTOR, ".room-input").send_keys("room")

        print("\n" + self.vars["wanIp"] + " " + self.vars["country"] + " " +
              self.vars["region"] + " " + self.vars["city"] + " " + self.vars["isp"])
        self.driver.find_element(By.ID, "start-call").click()
        print("")
