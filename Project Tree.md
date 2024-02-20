```
epoch
├── .github
│   └── workflows
│       └── deploy.yaml
├── .gitignore
├── .pytest_cache
├── Block Diagram.docx
├── Block Diagram.pdf
├── Project Tree.md
├── ReadMe.md
├── epoch_backend
│   ├── .pytest_cache
│   ├── .venv
│   ├── Dockerfile
│   ├── __init__.py
│   ├── assets
│   │   ├── __init__.py
│   │   ├── db_params.json
│   │   └── epoch_db.sql
│   ├── business
│   │   ├── __init__.py
│   │   ├── api_endpoints
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   └── user_endpoints.py
│   │   ├── db_controller
│   │   │   ├── __init__.py
│   │   │   ├── access_media_persistence.py
│   │   │   ├── access_session_persistence.py
│   │   │   └── access_user_persistence.py
│   │   ├── services.py
│   │   ├── utils.py
│   │   └── webserver.py
│   ├── main.py
│   ├── objects
│   │   ├── __init__.py
│   │   ├── media.py
│   │   ├── session.py
│   │   └── user.py
│   ├── persistence
│   │   ├── __init__.py
│   │   ├── epoch
│   │   │   ├── __init__.py
│   │   │   ├── epoch_media_persistence.py
│   │   │   ├── epoch_session_persistence.py
│   │   │   └── epoch_user_persistence.py
│   │   ├── interfaces
│   │   │   ├── __init__.py
│   │   │   ├── media_persistence.py
│   │   │   ├── session_persistence.py
│   │   │   └── user_persistence.py
│   │   └── stubs
│   │       └── __init__.py
│   ├── requirements.txt
│   └── tests
│       ├── .pytest_cache
│       ├── __init__.py
│       ├── integration_tests.py
│       ├── test.jpg
│       └── webserver_tests.py
├── epoch_frontend
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   ├── images
│   │   │   ├── default_pfp.png
│   │   │   ├── epoch-logo-400.jpeg
│   │   │   └── epoch-logos-96.jpeg
│   │   ├── index.html
│   │   ├── styles
│   │   │   └── global.css
│   │   └── vendor
│   │       └── bootstrap.min.css
│   ├── server.js
│   └── src
│       ├── App.js
│       ├── __tests__
│       │   ├── frontend.tests.js
│       │   ├── mock.render.tests.js
│       │   └── mock.server.tests.js
│       ├── index.js
│       ├── modules
│       │   ├── NavBar.js
│       │   ├── Post.js
│       │   ├── Router.js
│       │   └── Spinner.js
│       ├── pages
│       │   ├── home.js
│       │   ├── login.js
│       │   ├── profile.js
│       │   └── register.js
│       ├── services
│       │   └── user.js
│       └── styles
│           ├── Login.css
│           ├── Register.css
│           ├── Spinner.scss
│           └── bootstrap.min.css
└── meetingMinutes
    ├── Jan18Minutes.md
    ├── Jan23Minutes.md
    └── Jan27Minutes.md
```

```
tree -a --gitignore -I '.git' 
```