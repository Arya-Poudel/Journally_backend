# Journally_backend

This is the backend for [Journally](https://arya-poudel.github.io/Journally_frontend/#/) website.

The journals are encrypted using aes-192-cbc encryption, with key derived from your password, so that no one can else can read your journals.

Uses jwt for password authentication.

Uses MongoDB for database.

This is hosted at [heroku](https://journally-backend.herokuapp.com/) and serves an API that can be accessed by specifed domain only.
