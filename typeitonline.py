import logging
import cgi
import os


from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.ext import db

class Draft(db.Model):
  author = db.UserProperty()
  subject = db.StringProperty()
  content = db.StringProperty(multiline=True)
  date = db.DateTimeProperty(auto_now_add=True)


class MainPage(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        draftContent = Draft()
        editing = False

        if user:
            drafts = db.GqlQuery("SELECT * FROM Draft WHERE author = :1 ORDER BY date DESC LIMIT 10", user)
            key = self.request.get('key')
            if (len(key) > 0):
                draftContent = Draft.get(key)
                editing = True

            url = users.create_logout_url(self.request.uri)
            url_linktext = 'Logout'
            name = user.nickname()
        else:
            drafts = []
            url = users.create_login_url(self.request.uri)
            url_linktext = 'Login'
            name = ''

        template_values = {
            'editing':editing,
            'drafts':drafts,
            'draftContent':draftContent,
            'name': name,
            'url': url,
            'url_linktext': url_linktext
        }

        path = os.path.join(os.path.dirname(__file__), 'typeitonline.html')
        self.response.out.write(template.render(path, template_values))

class DeleteDraft(webapp.RequestHandler):
    def get(self):
        logging.error("DeleteDraft-e:")
        user = users.get_current_user
        key = self.request.get('key')
        if key:
            draftContent = Draft.get(key)
            draftContent.delete()

        self.redirect('/draftList')

class SaveDraft(webapp.RequestHandler):
    def post(self):
        user = users.get_current_user
        key = self.request.get('key')
        if (len(key) > 0):
            draft = Draft.get(key)
        else:
            draft = Draft()
            draft.author = users.get_current_user()

        draft.content = self.request.get('content')
        end = len(draft.content)
        if end > 10:
            end = 10

        draft.subject = draft.content[0:end]
        draft.put()

        self.redirect('/home')

application = webapp.WSGIApplication(
                                    [('/home', MainPage),
                                       ('/deleteDraft', DeleteDraft),
                                       ('/saveDraft', SaveDraft)],
                                       debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()