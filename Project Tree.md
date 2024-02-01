```
epoch
├── .github
│   └── workflows
│       └── ci.yaml
├── .gitignore
├── Block Diagram.docx
├── Block Diagram.pdf
├── Project Tree.md
├── ReadMe.md
├── epoch_backend
│   ├── .venv
│   ├── Dockerfile
│   ├── assets
│   │   ├── db_params.json
│   │   ├── epoch_db.sql
│   │   └── virtual-bonito-412515-fed6b41548c9.json
│   ├── business
│   │   ├── api_endpoints
│   │   │   ├── router.py
│   │   │   └── user_endpoints.py
│   │   ├── db_controller
│   │   │   ├── access_media_persistence.py
│   │   │   ├── access_session_persistence.py
│   │   │   └── access_user_persistence.py
│   │   ├── services.py
│   │   ├── utils.py
│   │   └── webserver.py
│   ├── main.py
│   ├── objects
│   │   ├── media.py
│   │   ├── session.py
│   │   └── user.py
│   ├── persistence
│   │   ├── epoch
│   │   │   ├── epoch_media_persistence.py
│   │   │   ├── epoch_session_persistence.py
│   │   │   └── epoch_user_persistence.py
│   │   ├── interfaces
│   │   │   ├── media_persistence.py
│   │   │   ├── session_persistence.py
│   │   │   └── user_persistence.py
│   │   └── stubs
│   ├── requirements.txt
│   └── tests
├── epoch_frontend
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   ├── fonts
│   │   ├── images
│   │   │   └── default_pfp.png
│   │   ├── index.html
│   │   ├── styles
│   │   │   └── global.css
│   │   └── vendor
│   │       └── bootstrap.min.css
│   ├── server.js
│   ├── src
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── modules
│   │   │   ├── NavBar.js
│   │   │   ├── Post.js
│   │   │   ├── Router.js
│   │   │   └── Spinner.js
│   │   ├── pages
│   │   │   ├── home.js
│   │   │   ├── login.js
│   │   │   ├── profile.js
│   │   │   └── register.js
│   │   ├── services
│   │   │   └── user.js
│   │   ├── styles
│   │   │   ├── Login.css
│   │   │   ├── Register.css
│   │   │   ├── Spinner.css
│   │   │   └── bootstrap.min.css
│   │   └── utils
│   │       └── LoadingContext.js
│   └── tests
└── meetingMinutes
    ├── Jan18Minutes.md
    ├── Jan23Minutes.md
    └── Jan27Minutes.md
```

```
tree -a --gitignore -I '.git' 
```