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
    secret_key = str(random.random())[2:]
    return secret_key


def create_secret_key(db, name):
    secret_key = gen_secret_key()
    db["users_secret_key"][name] = secret_key
    return {"secret_key": secret_key}



def save_user(db, form):
    name = form["name"]
    password = form["password"]
    if name in db["users"].keys():
        raise "Name in base."
    else:
        db["users"][name] = password
        return create_secret_key(db, name)


def login_user(db, form):
    name = form["name"]
    password = form["password"]
    if name in db["users"].keys():
        if password == db["users"][name]:
            return create_secret_key(db, name)
        else:
            raise WrongPass("Wrong password.")
    else:
        raise UserNotRegister("User not register.")
    

def save_result(db, form):
    name = form["name"]
    result = form["result"]
    secret_key = form["secret_key"]

    if secret_key == str(db["users_secret_key"][name]):   
        db["results"][name] = int(result)
        return db["results"]
    else:
        raise SecretKeyWrong("Secret key is wrong!")


def get_result(db, form):
    return db["results"]

def secret_key_name(db, form):
    name = form["name"]
    return db["users_secret_key"]



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
            self.path = "/index.html"
            
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
                #print("This shit!: ", curdir + "/static" + self.path)
                #print("Type curdir: ", type(curdir), "   Type self.path: ", type(self.path))
                
                f = open((curdir + "/static" + self.path), "rb") 
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
            content_length = int(self.headers['Content-Length']) 
            post_data = self.rfile.read(content_length)
            post_data = post_data.decode("utf-8")    
            form = json.loads(post_data)
            
            request_type = form["type"] #request_type

            response = 0
            
            if request_type in request_settings.keys():
                response = request_settings[request_type](my_db, form)
            else:
                raise "Requset type not register! Something went wrong!"


            print("This form: ", form,\
                "  Reques type: ", request_type,\
                "  Answer: ", response)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            response = json.dumps(response).encode("utf-8")
            
            self.wfile.write(response)         
        except:
            for item in traceback.format_exception(*sys.exc_info()):
                print(item)
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
