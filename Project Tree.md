```
epoch
├── .github
│   └── workflows
│       └── ci.yaml
├── .gitignore
├── Project Tree.md
├── ReadMe.md
├── epoch_backend
│   ├── db
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── db_stub.py
│   │   └── utils.py
│   ├── main.py
│   ├── requirements.txt
│   ├── tests
│   └── webserver
│       ├── db_logic_interface.py
│       ├── router.py
│       ├── utils.py
│       └── webserver.py
└── epoch_frontend
    ├── package-lock.json
    ├── package.json
    ├── public
    │   ├── fonts
    │   ├── images
    │   ├── index.html
    │   ├── styles
    │   │   └── global.css
    │   └── vendor
    │       └── bootstrap.min.css
    ├── src
    │   ├── App.js
    │   ├── index.js
    │   ├── modules
    │   │   └── Router.js
    │   ├── pages
    │   │   ├── home.js
    │   │   ├── user.js
    │   │   ├── profile.js
    │   │   └── register.js
    │   ├── services
    │   ├── styles
    │   └── utils
    └── tests

```

```
tree -a --gitignore -I '.git' -o ./Project\ Tree.md  
```