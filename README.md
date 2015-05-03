# Angular Comments

This is a demo of a simple comments system using AngularJS

# Run

Install dependencies

    npm install

Start the server

    npm start
    
# How it works

The comments module is implemented as an angular directive, which makes it ideal for re-usability and extending. This means to add comments functionality anywhere in the app all you would have to do is add a `<div data-comments></div>` element in the markup. 

The current implementation uses angular's ngResource component to create an AJAX call to load and add comments. Right now comments are loaded from a single location (see the `mock/` directory). To make it useful for loading comments related to different resources it can be extended to allow specifying an "entityId" with which to load comments from, e.g. it could be used to load from a REST api by amending the URL like so: `/api/<entityId>/comments/`
