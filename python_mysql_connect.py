# Version 1.0.0
# Module for connect project server to Database
# 

from mysql.connector import MySQLConnection, Error
from python_mysql_dbconfig import read_db_config


# Print all users in Database
def print_db_users():
    try:
        query = """SELECT *
                FROM users"""
        
        dbconfig = read_db_config()
        conn = MySQLConnection(**dbconfig)
        cursor = conn.cursor()
        cursor.execute(query)

        row = cursor.fetchone()

        while row is not None:
            print(row)
            row = cursor.fetchone()

    except Error as e:
        print(e)

    finally:
        cursor.close()
        conn.close()


# Add new user in Database
def add_new_db_user(user_name, user_pass, user_sec_key):
    try:
        user = (user_name, user_pass, user_sec_key)
        query = """INSERT INTO users(user_name,user_password,
                                     user_secret_key)
                   VALUES(%s,%s,%s)"""

        dbconfig = read_db_config()
        conn = MySQLConnection(**dbconfig)
        cursor = conn.cursor()
        cursor.execute(query, user)

        conn.commit()
    except Error as e:
        print('Error:', e)

    finally:
        cursor.close()
        conn.close()


# Checking whether the user is in the Database 
def user_in_db(user):
    try:
        user_in = (user,)
        query = """SELECT *
                   FROM users
                   WHERE BINARY user_name = %s"""

        dbconfig = read_db_config()
        conn = MySQLConnection(**dbconfig)
        cursor = conn.cursor()
        cursor.execute(query, user_in)

        row = cursor.fetchone()

        if row == None:
            return 0
        else:
            return 1
        
    except Error as e:
        print('Error:', e)

    finally:
        cursor.close()
        conn.close()


# To update user's secret key in Database
def update_secret_key(user_name, new_data):
    try:
        user_in = (new_data, user_name)
        query = """UPDATE users
                   SET user_secret_key = %s
                   WHERE BINARY user_name = %s"""

        dbconfig = read_db_config()
        conn = MySQLConnection(**dbconfig)
        cursor = conn.cursor()
        cursor.execute(query, user_in)

        conn.commit()
        
    except Error as e:
        print('Error:', e)

    finally:
        cursor.close()
        conn.close()


# Checking whether the password is the user's password
def user_pass_in_db(user):
    try:
        user_in = (user,)
        query = """SELECT user_password
                   FROM users
                   WHERE BINARY user_name = %s"""

        dbconfig = read_db_config()
        conn = MySQLConnection(**dbconfig)
        cursor = conn.cursor()
        cursor.execute(query, user_in)

        row = cursor.fetchone()

        if row == None:
            return 0
        else:
            return row[0]
        
    except Error as e:
        print('Error:', e)

    finally:
        cursor.close()
        conn.close()


# Checking whether the secret key is the user's secret key
def user_sec_key_in_db(user):
    try:
        user_in = (user,)
        query = """SELECT user_secret_key
                   FROM users
                   WHERE BINARY user_name = %s"""

        dbconfig = read_db_config()
        conn = MySQLConnection(**dbconfig)
        cursor = conn.cursor()
        cursor.execute(query, user_in)

        row = cursor.fetchone()

        if row == None:
            return 0
        else:
            return row[0]
        
    except Error as e:
        print('Error:', e)

    finally:
        cursor.close()
        conn.close()


# Print all results in Database
def print_db_results():
    try:
        query = """SELECT *
                FROM results"""
        
        dbconfig = read_db_config()
        conn = MySQLConnection(**dbconfig)
        cursor = conn.cursor()
        cursor.execute(query)

        row = cursor.fetchone()

        while row is not None:
            print(row)
            row = cursor.fetchone()

    except Error as e:
        print(e)

    finally:
        cursor.close()
        conn.close()


# Add new result in Database
def add_new_result(user_name, result):
    try:
        user = (user_name, result)
        query = """INSERT INTO results(user_name,result)
                   VALUES(%s,%s)"""

        dbconfig = read_db_config()
        conn = MySQLConnection(**dbconfig)
        cursor = conn.cursor()
        cursor.execute(query, user)

        conn.commit()
    except Error as e:
        print('Error:', e)

    finally:
        cursor.close()
        conn.close()


# Return number of results in tuple type
def top_results_in_db(how_many_results):
    try:
        many_results = (how_many_results,)
        
        query = """SELECT *
                FROM results
                ORDER BY result
                LIMIT 0,%s"""
        
        dbconfig = read_db_config()
        conn = MySQLConnection(**dbconfig)
        cursor = conn.cursor()
        cursor.execute(query, many_results)

        row = cursor.fetchone()
        
        count = 0
        top_list = []
        
        while (row is not None) and (count < how_many_results):
            count += 1   
            this_result = [count, row[1], row[2]]
            top_list.append(this_result)
            row = cursor.fetchone()

        return tuple(top_list)
        
    except Error as e:
        print(e)

    finally:
        cursor.close()
        conn.close()
