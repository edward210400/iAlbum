An album that can be used to view pictures of yourself and your friends.

For trial:
Run the following command on on the path where you install mongodb ./bin/mongod  --dbpath YourPath/iAlbum/AlbumService/data

Then, run the following command on the path where you install mongodb:
./bin/mongo
use assignment2
db.userList.insert({ "username" : "Eddie", "password" : "123456", "friends" : [ "Ken", "Alice", "Bill" ] })
db.userList.insert({ "username" : "Ken", "password" : "123456", "friends" : [ "Eddie", "Alice", "Bill" ] })
db.userList.insert({ "username" : "Alice", "password" : "123456", "friends" : [ "Ken", "Eddie", "Bill" ] })
db.userList.insert({ "username" : "Bill", "password" : "123456", "friends" : [ "Ken", "Alice", "Eddie" ] })
db.photoList.insert({ "url" : "http://localhost:3002/uploads/1.jpg", "userid" : "5de520396669c50a7b85b39f", "likedby" : [ "Ken", "Alice", "Eddie", "Bill" ] })     
db.photoList.insert({ "url" : "http://localhost:3002/uploads/2.jpg", "userid" : "5de520396669c50a7b85b39f", "likedby" : [ "Ken", "Alice", "Eddie", "Bill" ] })     
db.photoList.insert({ "url" : "http://localhost:3002/uploads/4.jpg", "userid" : "5de520396669c50a7b85b39f", "likedby" : [ "Ken", "Alice", "Eddie", "Bill" ] })     
db.photoList.insert({ "url" : "http://localhost:3002/uploads/11.jpg", "userid" : "5de40e4f051a284e2a018c62", "likedby" : [ "Ken", "Bill", "Alice" ] })
db.photoList.insert({ "url" : "http://localhost:3002/uploads/12.jpg", "userid" : "5de40e4f051a284e2a018c62", "likedby" : [ "Bill", "Alice", "Ken" ] })
db.photoList.insert({ "url" : "http://localhost:3002/uploads/13.jpg", "userid" : "5de40e4f051a284e2a018c62", "likedby" : [ "Alice", "Bill", "Ken" ] })
db.photoList.insert({ "url" : "http://localhost:3002/uploads/14.jpg", "userid" : "5de40e4f051a284e2a018c62", "likedby" : [ "Ken", "Bill", "Alice" ] })
db.photoList.insert({ "url" : "http://localhost:3002/uploads/15.jpg", "userid" : "5de40e4f051a284e2a018c62", "likedby" : [ "Ken", "Bill", "Alice" ] })
db.photoList.insert({ "url" : "http://localhost:3002/uploads/0.6790791310495359.jpg", "userid" : "5de520866669c50a7b85b3a2", "likedby" : [ "Eddie", "Alice" ] })   
db.photoList.insert({ "url" : "http://localhost:3002/uploads/0.5911921520608368.jpg", "userid" : "5de5206e6669c50a7b85b3a1", "likedby" : [ "Eddie" ] })
db.photoList.insert({ "url" : "http://localhost:3002/uploads/0.3747606540650015.jpg", "userid" : "5de520396669c50a7b85b39f", "likedby" : [ "Eddie", "Alice" ] })   
db.photoList.insert({ "url" : "http://localhost:3002/uploads/0.2244637285539075.jpg", "userid" : "5de520396669c50a7b85b39f", "likedby" : [ "Alice" ] })
db.photoList.insert({ "url" : "http://localhost:3002/uploads/0.41778003208112824.jpg", "userid" : "5de5206e6669c50a7b85b3a1", "likedby" : [ ] })
