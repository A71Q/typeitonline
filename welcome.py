import cgi
import os


from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template

class Welcome(webapp.RequestHandler):
    def get(self):
        self.redirect("/home")

application = webapp.WSGIApplication( [('/', Welcome)], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()