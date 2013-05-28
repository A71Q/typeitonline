import logging
import cgi
import os


from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.ext import db


class DraftList(webapp.RequestHandler):
    def get(self):
        logging.error("DraftList-e:")
        user = users.get_current_user()

        if user:
            drafts = db.GqlQuery("SELECT * FROM Draft WHERE author = :1 ORDER BY date DESC LIMIT 10", user)
            url = users.create_logout_url(self.request.uri)
            url_linktext = 'Logout'
            name = user.nickname()
        else:
            drafts = []
            url = users.create_login_url(self.request.uri)
            url_linktext = 'Login'
            name = ''

        template_values = {
            'drafts':drafts,
            'name': name,
            'url': url,
            'url_linktext': url_linktext
        }

        path = os.path.join(os.path.dirname(__file__), 'draftList.html')
        self.response.out.write(template.render(path, template_values))


application = webapp.WSGIApplication([('/draftList', DraftList)], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()