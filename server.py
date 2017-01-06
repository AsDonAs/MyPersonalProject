# This is an example of how to start a simple HTTP server (using Python 3.x).

from http.server import HTTPServer, CGIHTTPRequestHandler
import os
import urllib
import cgi
import sys
import traceback
import random
import json


def gen_secret_key():
    secret_key = random.random()
    return secret_key


def save_user(db, form):
    name = form["name"].value
    password = form["password"].value
    print("DB: ", db["users"], "   Name: ", name, "    Password: ", password)
    if name in db["users"].keys():
        raise "Name in base."
    else:
        db["users"][name] = password
        return 1
        #return "User registed."


def login_user(db, form):
    name = form["name"].value
    password = form["password"].value
    print("User ", name, " loggining in!")
    if name in db["users"].keys():
        if password == db["users"][name]:
            db["users_secret_key"][name] = gen_secret_key()
            return 1
            #return "User login."
        else:
            raise WrongPass("Wrong password.")
    else:
        raise UserNotRegister("User not register.")
    

def save_result(db, form):
    name = form["name"].value
    result = form["result"].value
    secret_key = form["secret_key"].value

    if secret_key == str(db["users_secret_key"][name]):
       
        print("Saving result!")
    
        db["results"][name] = int(result)
    
        print("Now ", name, " have result: ", db["results"][name])
        print(db["results"])
        return 1
        #return "All ok! Secret key: %s" % secret_key
    else:
        raise SecretKeyWrong("Secret key is wrong!")


def get_result(db, form):
    print(db["results"])

def secret_key_name(db, form):
    name = form["name"].value
    print("Name: ", name, "    Secret key: ", db["users_secret_key"][name])



my_db = {}
my_db["users"] = {}
my_db["results"] = {}
my_db["users_secret_key"] = {}


request_settings = {"0": save_user, "1": login_user, "2": save_result,\
                    "4": get_result, "9": secret_key_name}


curdir = os.path.dirname(os.path.abspath(__file__))

class HttpHandler(CGIHTTPRequestHandler):
    def do_GET(self):
        
        if self.path == "/":
            self.path = "/static/index.html"
            
        print("Self.path:  ", self.path, "You have GET send!")
        

        try:
            #Check the file extension required and
            #set the right mime type
            
            sendReply = False
            if self.path.endswith(".html"):
                mimetype='text/html'
                sendReply = True
            if self.path.endswith(".jpg"):
                mimetype='image/jpg'
                sendReply = True
            if self.path.endswith(".gif"):
                mimetype='image/gif'
                sendReply = True
            if self.path.endswith(".js"):
                mimetype='application/javascript'
                sendReply = True
            if self.path.endswith(".css"):
                mimetype='text/css'
                sendReply = True

            if sendReply == True:
                #Open the static file requested and send it
                f = open(curdir + self.path, "rb") 
                self.send_response(200)
                self.send_header('Content-type',mimetype)
                self.end_headers()
                self.wfile.write(f.read())
                f.close()
        except IOError:
            self.send_error(404, "File Not Found: %s" % self.path)

    def do_POST(self):
        print("My POST request!")

        try:
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={"REQUEST_METHOD": "POST"}
            )

            request_type = form["type"].value #request_type

            answer = 0
            
            if request_type in request_settings.keys():
                answer = request_settings[request_type](my_db, form)
            else:
                raise "Requset type not register! Something went wrong!"


            if answer == 1:
                print("All ok!")

            #print("Answer: ", answer)

            #for item in form.list:
            #    print (item.name, "=", item.value)

            #print(my_db)
            
        except:
            for item in traceback.format_exception(*sys.exc_info()):
                print(item)
            #print("Something went wrong!", sys.exc_info()[0])
            self.send_error(500)

        


port = 8000

try:
    #Create a web server and define the handler to manage the
    #incoming request

    httpd = HTTPServer(('', port), HttpHandler)

    print("Starting simple_httpd on port: " + str(httpd.server_port))

    #Wait forever for incoming htto requests
    httpd.serve_forever()

except KeyboardInterrupt:
    print("^C received, shutting down the web server!")
    server.socket.close()
