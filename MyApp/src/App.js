import React from 'react';
import axios from "axios";
import ReactDOM from 'react-dom'; 
import './App.css';
import $ from 'jquery';
import update from 'immutability-helper';


class MainPage extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      friends: [],
      loginName: '',
      loginPassword: '',
      loginState: -1,
      currentUserFriends:[],
      currentPhotos: [],
      currentLike:'',
      photoToEnlarge:0,
      usersPhoto:0,
      photosUploaded: null,
      current: "",
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handlePassChange = this.handlePassChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleloadphotos = this.handleloadphotos.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleEnlarge = this.handleEnlarge.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleDeletePhoto = this.handleDeletePhoto.bind(this);
    this.handleInputPhoto = this.handleInputPhoto.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  handleUpload(e){
    e.preventDefault()
    if(this.state.photosUploaded != null){
      var fileData = new FormData();
      fileData.append('image',this.state.photosUploaded);
      uploadphoto(fileData).then(result => 
        {
        this.setState({
          currentPhotos: this.state.currentPhotos.concat({"_id":result.data[0][0], "url":result.data[0][1], "likedby":[], "userid":0}),
        })
      });
    }
  }

  handleInputPhoto(e){
    e.preventDefault(e)
    this.setState({
      photosUploaded: e.target.files[0],
    })
  }

  handleDeletePhoto(e){
    e.preventDefault(e);
    var photoid = e.target.value;
    var index = "";
    var confirmation = window.confirm('Are you sure you want to delete this photo?');
    if(confirmation === true){
      deletephoto(photoid).then(result => {
        if(result.data.msg === ''){
          for(var i=0; i<this.state.currentPhotos.length; i++){
            if(photoid === this.state.currentPhotos[i]._id){
              index = i;
            }
          }
          var currentcollection = this.state.currentPhotos;
          if (index !== -1) {
            currentcollection.splice(index, 1);
            this.setState({currentPhotos: currentcollection});
          }
          if(this.state.photoToEnlarge != 0 ){
            this.setState({
              photoToEnlarge:0,
            })
          }
        }
        else{
          alert(result.data.msg)
        }
      });
    }
  }

  handleLike(e){
    e.preventDefault(e);
    var photoid = e.target.value;
    updatelike(photoid).then(result =>{
      var index = "";
      var currentdata = this.state.currentPhotos;
      var currentenlarge = this.state.photoToEnlarge;
      for(var i=0;i<this.state.currentPhotos.length;i++){
        if(photoid === this.state.currentPhotos[i]._id){
          index = i;
        }
      }
      var updateddata = update(currentdata[index], {likedby: {$set: result.data}});
      var newData = update(currentdata, {
        $splice: [[index, 1, updateddata]]
      });
      this.setState({
        currentPhotos: newData,
      })
      if(this.state.photoToEnlarge!=0){
        var updateenlarge = update(currentenlarge, {likedby: {$set: result.data}});
        this.setState({
          photoToEnlarge: updateenlarge,
        })
      }
    });
  }

  handleClose(e){
    e.preventDefault();
    var id = "";
    if(this.state.usersPhoto===1){
      id = 0;
    }
    if(this.state.usersPhoto===0){
      id = this.state.photoToEnlarge.userid;
    }
    this.setState({
      photoToEnlarge:0,
    })
    loadphotos(id).then(result => 
      {
        this.setState({
          currentPhotos: [],
        })
        for(var i = 0; i<result.data.length; i++){
          this.setState({
            currentPhotos: this.state.currentPhotos.concat({"_id":result.data[i][0], "url":result.data[i][1], "likedby":result.data[i][2], "userid":id}),
          })
        }
      })
  }

  handleEnlarge(e){
    e.preventDefault(e);
    var photoId = e.target.rel;
    var photoinfo = 0;
    for( var i=0; i<this.state.currentPhotos.length; i++){
      if(photoId == this.state.currentPhotos[i]._id){
        photoinfo = this.state.currentPhotos[i];
      }
    }
    this.setState({
      photoToEnlarge: photoinfo,
      photosUploaded: null,
    })
  }

  handleNameChange(name){
    this.setState({
      loginName: name
    })
  }

  handlePassChange(pass){
    this.setState({
      loginPassword: pass
    })
  }

  handleSubmit(e){
    e.preventDefault();
    var userData = { 
      "username" : this.state.loginName,
      "password": this.state.loginPassword   
    }
    if(this.state.loginName === '' || this.state.loginPassword === ''){
      alert("You must enter username and password");
    }
    else{
        login(userData).then(result => 
        {
          if(result.data.msg==="Login Failure"){
            alert(result.data.msg);
          }
          else{
            this.setState({
              loginState: 1,
            })
            for(var i = 0; i<result.data.length; i++){
              this.setState({
                friends: this.state.friends.concat({"_id":result.data[i][0], "username":result.data[i][1]})
              })
            }
          }
      });
        
    }
  }

  handleloadphotos(e){
    e.preventDefault(e);
    this.setState({
      current: e.target.rel,
    })
    var id = e.target.rel;
    if(id==="0"){
      this.setState({
        usersPhoto: 1,
      })
    }
    if(id!="0"){
      this.setState({
        usersPhoto: 0,
      })
    }
    this.setState({
      photoToEnlarge:0,
      photosUploaded: null,
    })
    loadphotos(id).then(result => 
      {
        this.setState({
          currentPhotos: [],
        })
        for(var i = 0; i<result.data.length; i++){
          this.setState({
            currentPhotos: this.state.currentPhotos.concat({"_id":result.data[i][0], "url":result.data[i][1], "likedby":result.data[i][2], "userid":id}),
          })
        }
      })
  }

  handleLogout(e){
    e.preventDefault();
    logout().then(result => 
      {
        if(result.data.msg===""){
          this.setState({
            friends: [],
            loginName: '',
            loginPassword: '',
            loginState: -1,
            currentUserFriends:[],
            currentPhotos: [],
            currentLike:'',
            photoToEnlarge:0,
            usersPhoto:0,
            photosUploaded: null,
            current: "",
          })
        }
      })
  }

  componentDidMount() {
    loadUsers().then(result => 
      {
        if(result.data.msg===""){
          this.setState({
            loginState: -1,
          })
        }
        else{
          this.setState({
            loginState: 1,
            loginName: result.data[0],
          })
          for(var i = 1; i<result.data.length; i++){
          this.setState({
            friends: this.state.friends.concat({"_id":result.data[i][0], "username":result.data[i][1]})
          })
          }
        }
    });
  }
  
  render(){
    return(
      <div id="background">
        <div id="top">
          <h1 className="ialbum">iAlbum</h1>
          <LoginInfo
            onNameChange = {this.handleNameChange}
            onPassChange = {this.handlePassChange}
            handleSubmit = {this.handleSubmit}
            handleLogout = {this.handleLogout}
            loginState = {this.state.loginState}
            loginName = {this.state.loginName}
            loginPassword = {this.state.loginPassword}
            friends = {this.state.friends}
          />
        </div>
        <div id="bottom" className="bottompart">
          <div id="left" className="bottompart">
            <Albums
              friends = {this.state.friends}
              loginState = {this.state.loginState}
              handleloadphotos = {this.handleloadphotos}
              current = {this.state.current}
            />
          </div>
          <div id="right" className="bottompart">
            <Photos
              currentPhotos = {this.state.currentPhotos}
              handleEnlarge = {this.handleEnlarge}
              photoToEnlarge = {this.state.photoToEnlarge}
              usersPhoto = {this.state.usersPhoto}
              handleClose = {this.handleClose}
              handleLike = {this.handleLike}
              handleDeletePhoto = {this.handleDeletePhoto}
              handleInputPhoto = {this.handleInputPhoto}
              handleUpload = {this.handleUpload}
            />
          </div>
        </div>
      </div>
    )
  }
}
export async function loadUsers() {
  try {
    const res = await axios({
      method: 'get',
      url: "http://localhost:3002/init",
      dataType: 'json',
      withCredentials: true
    })
    return res;
  } catch (error) {
    alert(error);
  }
}

export async function login(userData) {
  try {
    const res = await axios({
      method: 'post',
      url: "http://localhost:3002/login",
      data: userData,
      withCredentials: true
    })
    return res;
  } catch (error) {
    alert(error);
  }
}

export async function logout() {
  try {
    const res = await axios({
      method: 'get',
      url: "http://localhost:3002/logout",
      withCredentials: true
    })
    return res;
  } catch (error) {
    alert(error);
  }
}

export async function loadphotos(id) {
  try {
    const res = await axios({
      method: 'get',
      url: "http://localhost:3002/getalbum/"+id,
      dataType: 'json',
      withCredentials: true
    })
    return res;
  } catch (error) {
    alert(error);
  }
}

export async function updatelike(userid) {
  try {
    const res = await axios({
      method: 'put',
      url: "http://localhost:3002/updatelike/"+userid,
      dataType: 'json',
      withCredentials: true
    })
    return res;
  } catch (error) {
    alert(error);
  }
}

export async function deletephoto(photoid){
  try {
    const res = await axios({
      method: 'delete',
      url: "http://localhost:3002/deletephoto/"+photoid,
      dataType: 'json',
      withCredentials: true
    })
    return res;
  } catch (error) {
    alert(error);
  }
}

export async function uploadphoto(fileData){
  try {
    const res = await axios({
      method: 'post',
      url: "http://localhost:3002/uploadphoto",
      data: fileData,
      headers: {
        'content-type': 'multipart/form-data'
      },
      withCredentials: true
    })
    return res;
  } catch (error) {
    alert(error);
  }
}

export default MainPage;

class LoginInfo extends React.Component{

  constructor(props) {
    super(props);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handlePassChange = this.handlePassChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }
  
  handleNameChange(e){
    this.props.onNameChange(e.target.value);
  }
  
  handlePassChange(e){
    this.props.onPassChange(e.target.value);
  }

  handleSubmit(e){
    this.props.handleSubmit(e);
  }

  handleLogout(e){
    this.props.handleLogout(e);
  }

  render(){
    if(this.props.loginState === -1){
      return(
        <div id="LoginInfo">
          <div>
            Username:
            <input className="input_text"
              type="text"
              value={this.props.loginName}
              onChange={this.handleNameChange}
            />
          </div>
          <div>
            Password:    
            <input className="input_text"
              type="text"
              value={this.props.loginPassword}
              onChange={this.handlePassChange}
            />
          </div>
          <button className="LoginButton" onClick={this.handleSubmit}>Login</button>
        </div>
      )
    }
    else{
      return(
        <div className="nameInfo">
          <div>
            Hello, {this.props.loginName}!
          </div>
          <button className="LogoutButton" onClick={this.handleLogout}>Logout</button>
        </div>
      )
    }
  }
}

class Albums extends React.Component{
  constructor(props) {
    super(props);
    this.handleloadphotos = this.handleloadphotos.bind(this);
    
  }

  handleloadphotos(e){
    this.props.handleloadphotos(e);
  }

  render(){
    var condition = false;
    if(this.props.current=="0"){
      condition = true;
    }
    let rows = [];
    this.props.friends.map((friend) => {
        rows.push(
          <AlbumRow
            friend={friend}
            handleloadphotos = {this.handleloadphotos}
            current = {this.props.current}
          />
        );
    });
    if(this.props.loginState === 1){
      return(
        <div className="albumlist">
          <div className={condition ? "blue":"black"} id="albums"><a rel="0" onClick={this.handleloadphotos} tabindex="1">My Album</a></div>
          {rows}
        </div>
      )
    }
    if(this.props.loginState === -1){
      return(
        null
      )
    }
  }
}

class AlbumRow extends React.Component{
  constructor(props) {
    super(props);
    this.handleloadphotos = this.handleloadphotos.bind(this);
  }

  handleloadphotos(e){
    this.props.handleloadphotos(e);
  }

  render() {
    const friend = this.props.friend;
    var condition = false;
    if(this.props.current==friend._id){
      condition = true;
    }

    return (
      <div className={condition ? "blue":"black"} id="albums"><a rel={friend._id} onClick={this.handleloadphotos} tabindex="1">{friend.username}'s Album</a></div>
    );
  }
}

class Photos extends React.Component{
  constructor(props) {
    super(props);
    this.handleEnlarge = this.handleEnlarge.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleDeletePhoto = this.handleDeletePhoto.bind(this);
    this.handleInputPhoto = this.handleInputPhoto.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  handleUpload(e){
    this.props.handleUpload(e);
  }

  handleInputPhoto(e){
    this.props.handleInputPhoto(e);
  }

  handleDeletePhoto(e){
    this.props.handleDeletePhoto(e);
  }

  handleEnlarge(e){
    this.props.handleEnlarge(e);
  }

  handleClose(e){
    this.props.handleClose(e);
  }

  handleLike(e){
    this.props.handleLike(e);
  }

  render(){
    let rows2 = [];
    this.props.currentPhotos.map((photo) => {
        rows2.push(
          <AllPhotos
            photo={photo}
            handleEnlarge = {this.handleEnlarge}
            usersPhoto = {this.props.usersPhoto}
            handleLike = {this.handleLike}
            handleDeletePhoto = {this.handleDeletePhoto}
          />
        );
    });
    if(this.props.photoToEnlarge === 0){
      if(this.props.usersPhoto === 0){
        return(
          <div className="photos">
            {rows2}
          </div>
        )
      }
      else{
        return(
          <div>
            <div className="photos">
              {rows2}
            </div>
            <div className="uploads">
              <input type="file" onChange={this.handleInputPhoto}></input>
              <button onClick={this.handleUpload} className="uploadButton">Upload Photo</button>
            </div>
          </div>
        )
      }
    }

    else{
      var z = 0;
      var likedby2 = "";
      for(var i=0; i<this.props.photoToEnlarge.likedby.length; i++){
        likedby2 = likedby2+this.props.photoToEnlarge.likedby[i];
        z++;
        if(z != this.props.photoToEnlarge.likedby.length){
          likedby2 = likedby2+", ";
        }
        if(z == this.props.photoToEnlarge.likedby.length){
          likedby2 = likedby2+" liked this photo!";
        }
      }
      if(this.props.usersPhoto===0){
        return(
          <div>
            <div>
              <button className="closeButton" onClick={this.handleClose}>X</button>
            </div>
            <div className="enlarge">
              <img src={this.props.photoToEnlarge.url} width="360" height="515" id={this.props.photoToEnlarge._id}></img>
            </div>
            <div>
              <div className="photoliker">
                {likedby2}
              </div>
              <button className="likedelete" value={this.props.photoToEnlarge._id} onClick={this.handleLike}>Like</button>
            </div>
          </div>
        )
      }
      else{
        return(
          <div>
            <div>
              <button className="closeButton" onClick={this.handleClose}>X</button>
            </div>
            <div className="enlarge">
              <img src={this.props.photoToEnlarge.url} width="360" height="515" id={this.props.photoToEnlarge._id}></img>
            </div>
            <div>
              <div className="photoliker">
                {likedby2}
              </div>
              <button className="likedelete" value={this.props.photoToEnlarge._id} onClick={this.handleDeletePhoto}>Delete</button>
            </div>
          </div>
        )
      }
    }
  }
}

class AllPhotos extends React.Component{
  constructor(props) {
    super(props);
    this.handleEnlarge = this.handleEnlarge.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleDeletePhoto = this.handleDeletePhoto.bind(this);
  }
  handleDeletePhoto(e){
    this.props.handleDeletePhoto(e);
  }

  handleEnlarge(e){
    this.props.handleEnlarge(e);
  }

  handleLike(e){
    this.props.handleLike(e);
  }

  render(){
    const photo = this.props.photo;
    var a = "#"+photo._id;
    var likedby = "";
    var j = 0;
    for(var i=0; i<photo.likedby.length; i++){
      likedby = likedby+photo.likedby[i];
      j++;
      if(j != photo.likedby.length){
        likedby = likedby+", ";
      }
      if(j == photo.likedby.length){
        likedby = likedby+" liked this photo!";
      }
    }
    if(this.props.usersPhoto===0){
      return(
        <div className="container">
          <div>
            <img src={photo.url} width="150" height="210" useMap={a} id={photo._id}></img>
            <map name={photo._id}>
              <area href="" shape="rect" coords="0,0,150,210" rel={photo._id} onClick={this.handleEnlarge}></area>
            </map>
          </div>
          <div className="bottom-box">
            <div className="liker"><font size="1">{likedby}</font></div>
            <button className="likeButton" value={photo._id} onClick={this.handleLike}>Like</button>
          </div>
        </div>
      )
    }
    else{
      return(
        <div className="container">
          <div>
            <img src={photo.url} width="150" height="210" useMap={a} id={photo._id}></img>
            <map name={photo._id}>
              <area href="" shape="rect" coords="0,0,150,210" rel={photo._id} onClick={this.handleEnlarge}></area>
            </map>
          </div>
          <div className="bottom-box">
            <div className="liker2"><font size="1">{likedby}</font></div>
            <button className="deleteButton" value={photo._id} onClick={this.handleDeletePhoto}>Delete</button>
          </div>
        </div>
      )
    }
  }
}


