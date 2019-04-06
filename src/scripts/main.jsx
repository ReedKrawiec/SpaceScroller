import React from 'react';
import { render } from 'react-dom';
import * as axios from 'axios';
var Masonry = require('react-masonry-component');

class FullScreenView extends React.Component {
  constructor() {
    console.log("test");
    super();
    this.state = {
      childClicked: 0
    };
    this.onClick = this.onClick.bind(this);
    this.validateImageUrl = this.validateImageUrl.bind(this);
  }
  validateImageUrl(url) {
    if (url.indexOf("imgur") !== -1 && url.indexOf("i.imgur") === -1) {
      let reversedUrl = url.split('').reverse().join('')
      let imgurId = reversedUrl.substring(0, reversedUrl.indexOf("/")).split('').reverse().join('');
      let finalUrl = `http://i.imgur.com/${imgurId}.png`;
      return finalUrl;
    }
    return url;
  }
  onClick() {
    if (this.state.childClicked == 0) {
      this.props.toggle();
    }
    this.state.childClicked = 0;
  }
  render() {
    let style;
    if (this.props.open === 0) {
      style = { display: "none" }
    }
    else {
      style = { display: "initial" }
    }
    let imageClass = "portrait";
    if (this.props.portrait === false)
      imageClass = "landscape";
    return (
      <div className="fullView" style={style} onClick={this.onClick}>
        <div className="fullPageHolder">
          <div className="container" onClick={() => { this.state.childClicked = 1 }}>
            <div className="img">
              <a target="_blank" href={this.validateImageUrl(this.props.data.url)}>
                <img className={imageClass} src={this.validateImageUrl(this.props.data.url)} />
              </a>
            </div>
            <div className="text-positioner">
              <p className="title">{this.props.data.title}</p>
              <p className="poster">{this.props.data.poster}</p>
              <a className="url" href={`http://reddit.com${this.props.data.redditUrl}`}>Reddit Link</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class PicCard extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.validateImageUrl = this.validateImageUrl.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  handleClick() {
    let portrait = false;
    if (this.el.naturalHeight > this.el.naturalWidth) {
      portrait = true;
    }
    this.props.changeViewerData(this.props.data, portrait)
    this.props.toggle();
  }
  componentDidMount() {

  }
  validateImageUrl(url) {
    console.log(url);
    if (url.indexOf("imgur") != -1 && url.indexOf("i.imgur") == -1) {
      let reversedUrl = url.split('').reverse().join('')
      let imgurId = reversedUrl.substring(0, reversedUrl.indexOf("/")).split('').reverse().join('');
      let finalUrl = `http://i.imgur.com/${imgurId}m.png`;
      return finalUrl;
    }
    if (url.indexOf("i.imgur") !== -1) {
      let splitArray = url.split(".");
      splitArray[2] = splitArray[2] + "m";
      let finalUrl = splitArray.join('.');
      console.log(finalUrl);
      return finalUrl;
    }
    return url;
  }
  render() {
    return (<div className="pic-card">
      <div className="main-container">
        <img ref={(el) => { this.el = el }} onClick={this.handleClick} src={this.validateImageUrl(this.props.data.url)} />
      </div>
    </div>)
  }
}
class Gallery extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      data: [],
      open: 0,
      after: "0",
      num: "0",
      portrait: false,
      loader: true,
      imageViewer: {
        redditUrl: "",
        url: "",
        poster: "",
        title: "",
      }
    }
    let _this = this;
    this.componentDidMount = this.componentDidMount.bind(this);
    this.toggleViewer = this.toggleViewer.bind(this);
    this.changeViewerData = this.changeViewerData.bind(this);
    this.addData = this.addData.bind(this);
    window.addEventListener("scroll", function (evt) {
      if ((window.innerHeight + window.scrollY - 130) >= document.body.offsetHeight && _this.state.loading === false) {
        _this.state.loading = true;
        axios.get(`https://infinitespacescroller.herokuapp.com/requestUrl?num=${_this.state.num}&after=${_this.state.after}`).then(function (resp) {
          _this.addData(resp.data);
          _this.state.loading = false;
        })
      }
    })
  }
  addData(newData) {
    this.state.num = newData.num;
    this.state.after = newData.after;
    let validated = this.validateUrls(newData)
    this.state.data = [...this.state.data, ...validated]
    this.forceUpdate();

  }
  changeViewerData(obj, portrait) {
    this.state.imageViewer = obj;
    this.state.portrait = portrait;
  }
  toggleViewer() {
    if (this.state.open === 0)
      this.state.open = 1;
    else
      this.state.open = 0;
    this.forceUpdate();
  }
  validateUrls(passed) {
    return passed.data.filter(function (el) {
      if (el.url.indexOf('imgur') > -1)
        return true;

      if (el.url.indexOf('.jpg') > -1 || el.url.indexOf('.png') > -1)
        return true;

      return false;
    });
  }
  componentDidMount() {
    let _this = this;
    this.state.loading = true;
    axios.get(`https://infinitespacescroller.herokuapp.com/requestUrl?num=${_this.state.num}&after=${_this.state.after}`).then(function (resp) {
      _this.state.num = resp.data.num;
      _this.state.after = resp.data.after;
      _this.state.data = _this.validateUrls(resp.data);
      _this.state.loading = false;
      _this.forceUpdate();
    })
    /*
    setTimeout(function(){
      _this.state.data = _this.validateUrls(testdata)
      _this.forceUpdate();
    },1000)*/
    _this.masonry.on('layoutComplete', this.handleLayoutComplete);
  }
  render() {
    let _this = this;
    return (
      <div>
        <FullScreenView open={this.state.open} portrait={this.state.portrait} data={this.state.imageViewer} toggle={this.toggleViewer} />
        <Masonry className="grid" options={{ fitWidth: true }} ref={function (c) { this.masonry === undefined ? this.masonry = c.masonry : ""; }.bind(_this)} >{this.state.data.map(function (el) {
          return <PicCard changeViewerData={_this.changeViewerData} toggle={_this.toggleViewer} data={el} />
        })}</Masonry>
      </div>);
  }
}
render(<Gallery />, document.getElementById("appHook"));
