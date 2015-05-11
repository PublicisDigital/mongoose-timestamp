Mongoose History Plugin
==========================

Mongoose plugin that adds createdAt and updatedAt auto-assigned date properties. Then it creates a history object which holds a copy of the current state.

## Installation

`npm install mongoose-mongoose`

## Usage

```javascript
var history = require('mongoose-mongoose');
var UserSchema = new Schema({
    username: String
});
UserSchema.plugin(history);
mongoose.model('User', UserSchema);
var User = mongoose.model('User', UserSchema)
```
The User model will now have `createdAt`, `updatedAt`, and `deleted` properties, which get 
automatically generated and updated when you save your document.

```javascript
var user = new User({username: 'Prince'});
user.save(function (err) {
  console.log(user.createdAt); // Should be approximately now
  console.log(user.createdAt === user.updatedAt); // true
  // Wait 1 second and then update the user
  setTimeout( function () {
    user.username = 'Symbol';
    user.save( function (err) {
      console.log(user.updatedAt); // Should be approximately createdAt + 1 second
      console.log(user.createdAt < user.updatedAt); // true
    });
  }, 1000);
});
```

You can specify custom property names by passing them in as options like this:

```javascript
mongoose.plugin(timestamps,  {
  createdAt: 'created_at', 
  updatedAt: 'updated_at'
});
```

Any model's updatedAt attribute can be updated to the current time using `touch()`.

## License 

(The MIT License)

Copyright (c) 2012 Nicholas Penree &lt;nick@penree.com&gt;

Based on [mongoose-types](https://github.com/bnoguchi/mongoose-types): Copyright (c) 2012 [Brian Noguchi](https://github.com/bnoguchi)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.