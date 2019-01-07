let MOBILE = AFRAME.utils.device.checkHeadsetConnected();
let all_skies = ['path', 'cow', 'hands', 'farm', 'bagfeet']
let skies = {
  cow: {
    path: "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2F360_1130_Stitch_XHC.JPG?1545527697587",
    rotation: "0 110 10"
  },
  path: {
    path: "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2F360_1123_Stitch_XHC.JPG?1545527699653",
    rotation: "4 93 -2"
  },
  hands: {
    path: "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2F20180721_SugarLoafRidgeStatePark_360V_003.JPG?1545615355830",
    rotation: "0 86 15"
  },
  farm: {
    path: "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2F360_1120_Stitch_XHC.JPG?1545527698204",
    rotation: "40 20 10"
  },
  bagfeet: {
    path: "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2F360_1125_Stitch_XHC.JPG?1545527699371",
    rotation: "0 270 0"
  },
  purple: {
    path: "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2Fpurple.jpg?1546581967074",
    rotation: "0 0 0"
  }
}
let rad = 50;
let polarToCart = (azi, rot, rad2, lookAt) => {
  rad2 = rad2 || rad;
  lookAt = lookAt || 10;
  let factor = 2 * Math.PI / 360;
  let x = rad2 * Math.sin(rot * factor) * Math.cos(azi * factor);
  let y = rad2 * Math.sin(rot * factor) * Math.sin(azi * factor);
  let z = rad2 * Math.cos(rot * factor);

  return {
    position: `${x} ${z} ${y}`,
    "look-at": `0 ${lookAt} 0`
  }
};

let fonts = {
  aileron: 'aileronsemibold',
  badscript: 'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/badscript/BadScript-Regular.json',
  dancingscript: 'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/dancingscript/DancingScript-Bold.json',
  handlee: 'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/handlee/Handlee-Regular.json',
  reeniebeanie: 'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/reeniebeanie/ReenieBeanie.json',
  labelleaurore: 'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/labelleaurore/LaBelleAurore.json',
  permanentmarker: 'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/permanentmarker/PermanentMarker-Regular.json',
  kalambold: 'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/kalam/Kalam-Bold.json',
  kalamreg: 'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/kalam/Kalam-Regular.json',
  patrickhand: 'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/patrickhand/PatrickHand-Regular.json'
}

class Text extends React.Component {
  constructor(props) {
    super(props);
    this.el = React.createRef();
  }

  componentDidMount() {
    this.el.current._onClick = this.props.onClick;
  }

  render() {
    return <a-text ref={this.el}
             text-click
             font={this.props.font || fonts.patrickhand}
             shader='msdf'
             geometry={this.props.noGeom ? '' : `primitive:plane; width:${this.props.geomWidth || 50}; height:${this.props.geomHeight || 3}` }
             material={this.props.material || "opacity: 0"}
             baseline={this.props.baseline || "top"}
             {...this.props}>
    </a-text>;
  }
}


let hoverEvent = {
  'event-set__down': "_event: mousedown; color: #A4377C",
  'event-set__enter': "_event: mouseenter; color: #DD78B8",
  'event-set__leave': "_event: mouseleave; color: white"
}


class Image extends React.Component {
  state = { frame: 0 }

  constructor(props) {
    super(props);
    this.el = React.createRef();
  }

  componentDidMount() {
    this.el.current._onClick = this.props.onClick;
    this._interval = setInterval(() => {
      this.setState({frame: (this.state.frame + 1) % 4})
    }, 400);
  }

  render() {
    let name = this.props.name;
    let sequence = [1, 2, 3, 2];
    let frame = MOBILE ? 0 : this.state.frame;
    let url = `#${name}${sequence[frame]}`;
    return <a-image ref={this.el} text-click {...this.props} {...hoverEvent} src={url} onClick={() => {
        if (!MOBILE) {
          let el = document.getElementById('cameraWrapper');
          let camRot = el.querySelector('[camera]').getAttribute('rotation');
          el.setAttribute('rotation', {
            y: -1 * camRot.y})
        }

        window.location = `/wedding/#${this.props.href}`;
      }}></a-image>;
  }
}

let Sky = (props) => {
  return <a-sky src={skies[props.skyName].path} radius={rad+25} rotation={skies[props.skyName].rotation} {...props}></a-sky>;
}

var first_view = true;

class Home extends React.Component {

  componentDidMount() {
    document.addEventListener('mousedown', () => {
      if (first_view) {
        document.querySelector("#purpleSky").emit('fade');
        document.querySelector("#panLogo").emit('fade');
        first_view = false;
        setTimeout(() => { this.forceUpdate(); }, 1000);
      }
    });
  }

  render() {
    return <a-entity>
      {first_view ?
        <Sky id = "purpleSky" radius = {rad+10} skyName = "purple" material = {first_view ? "opacity: 1" : "opacity: 0" }>
        <a-animation attribute="material.opacity" begin="fade" to="0" dur = "1000"></a-animation>
        </Sky> : null}

      <Sky id = "homeSky" skyName= "path" material = "opacity:1"></Sky>
      <Image name="cow" {...polarToCart(-10, 90)} width="23" height="23" href="/schedule" />
      <Image name="car" {...polarToCart(155, 95)} width="20" height="20" href="/hotels" />
      <Image name="cat" {...polarToCart(85, 100)} width="22" height="22" href="/dress" />

      <a-image src = "#click" {...polarToCart(9, 80)} width="20" height="20"></a-image>
      <a-image src = "#click" {...polarToCart(103, 95)} width="20" height="20"></a-image>
      <a-image src = "#click" {...polarToCart(172, 91)} width="20" height="20"></a-image>


      <a-image {...polarToCart(-90, 70)} src="#logo" width="60" height="40"></a-image>
      {first_view ?
        <a-image id = "panLogo" {...polarToCart(-90, 105)} src="#pan" width="30" height="20" material={first_view ? "opacity:1" : "opacity:0"}>
          <a-animation attribute="material.opacity" begin="fade" to="0" dur = "1000"></a-animation>
        </a-image> : null}


      <Text {...polarToCart(50, 85, rad+10)} value= "Save the Date!" width="200" align="center" color="white" font={fonts.dancingscript} />
      <Text {...polarToCart(50, 95,rad+15)} value="When: September 1, 2019\nWhere: Rutledge, Georgia" color="white" width="100" align="center" />
      {first_view ? null:
        <Text {...polarToCart(-80, 105)} value="RSVP" width="100" align="center"
        event-set__enter = "_event: mouseenter; color: #DD78B8"
        event-set__leave = "_event: mouseleave; color: white"
        font={fonts.dancingscript}
        onClick={() => { window.location = "https://goo.gl/forms/VyNIZGO1r19q2tpS2"; }}>
        </Text>}
    </a-entity>
  }
}

let Schedule = () => {
  return <a-entity>
      <Sky skyName="cow" />
      <Text {...polarToCart(-90, 75)} value="Schedule" width="200" align="center" color="black" />

      <Image name="house" {...polarToCart(-40, 80)} width="17" height="17" href="/" />
      <Image name="cat" {...polarToCart(100, 100,rad+10)} width="20" height="20" href="/dress" />
      <Image name="car" {...polarToCart(200, 100)} width="23" height="23" href="/hotels" />

      <a-entity  {...polarToCart(25, 82, rad+15)} geometry="primitive: plane; width: 55; height: 20" material="shader:flat; opacity: .5; color: #FFF6F6" />
      <Text {...polarToCart(25, 85,rad+1)} noGeom={true} value={
        `4:00-5:00pm - Guests arrive
5:00-5:30pm - Ceremony
5:30-7:30pm - Reception`
} width="60" align="center" color="black" baseline="center" />
      <Text {...polarToCart(25, 72,rad+15)} value="Ceremony" width="130" align="center" color="black" />

      <a-entity  {...polarToCart(150, 95, rad+15)} geometry="primitive: plane; width: 50; height: 20" material="shader:flat; opacity: .5; color: #FFF6F6" />
      <Text {...polarToCart(150, 95,rad+10)} noGeom={true} value={
          `Details TBA`
      } width="100" align="center" color="black" />
      <Text {...polarToCart(150, 85,rad+15)} value="Gifts" width="130" align="center" color="black" />

  </a-entity>
}

let Hotels = () => {
   // <Text {...polarToCart(80, 70)} noGeom={true} value={
   //        `
   //        Cost: $100/night`
   //    } width="100" align="center" color="black" />
  return <a-entity>
    <Sky skyName="hands" />
    <Text {...polarToCart(-90, 67)} value="Hotels" width="130" align="center" color="white" />
      <a-entity rotation = "0 0 -12">
        <Image name="house" {...polarToCart(130, 95)} width="20" height="20" href="/" />
      </a-entity>
      <a-entity rotation = "11 0 0 ">
         <Image name="cow" {...polarToCart(183, 80)} width="17" height="17" href="/schedule" />
      </a-entity>

      <a-entity rotation = "15 0 0">
        <Image name="cat" {...polarToCart(8, 90)} width="20" height="20" href="/dress" />
      </a-entity>

    <a-image src = "#stars" {...polarToCart(-40, 70)} width="25" height="25"></a-image>
    <a-image src = "#stars" {...polarToCart(220, 70)} width="25" height="25"></a-image>
    <a-image src = "#stars" {...polarToCart(-107, 67)} width="10" height="10"></a-image>
    <a-image src = "#stars" {...polarToCart(-75, 67)} width="10" height="10"></a-image>

    <a-entity  {...polarToCart(80, 90, rad+5)} geometry="primitive: plane; width: 70; height: 30" material="opacity: 0.5; color: white" />
    <Text {...polarToCart(80, 85)} value={"Accomodations: TBD"} width="60" align="center" color="white"/>
    <Text {...polarToCart(80, 93, rad+2)} geomWidth = "20" geomHeight = "3" value={"Hampton Inn"} width="65" align="center" color="white" onClick={() => {
        window.location = 'https://hamptoninn3.hilton.com/en/hotels/georgia/hampton-inn-covington-ATLCVHX/index.html'
      }}
      event-set__enter = "_event: mouseenter; color: #DD78B8"
      event-set__leave = "_event: mouseleave; color: white"
      />
    <Text {...polarToCart(80, 98, rad +1)} geomWidth = "20" geomHeight = "3" value={"La Quinta"} width="65" align="center" color="white" onClick={() => {
        window.location = 'https://www.lq.com/en/hotels/louisiana/covington/0866'
      }}
      event-set__enter = "_event: mouseenter; color: #DD78B8"
      event-set__leave = "_event: mouseleave; color: white"
      />
    <Text {...polarToCart(80, 103)} geomWidth = "20" geomHeight = "3" value={"Travelodge"} width="65" align="center" color="white" onClick={() => {
        window.location = 'https://www.wyndhamhotels.com/travelodge/covington-georgia/travelodge-covington/overview'
      }}
      event-set__enter = "_event: mouseenter; color: #DD78B8"
      event-set__leave = "_event: mouseleave; color: white"
      />
     <a-image src = "#click" {...polarToCart(100, 94)} width="20" height="20"  color = "white" ></a-image>
   </a-entity>
}

let Dress = () => {
  return <a-entity>
    <Sky skyName="farm" />
    <Text {...polarToCart(-90, 60, rad+10)} value="Attire" width="130" align="center" color="white" />

      <Image name="house" {...polarToCart(95, 135)} width="25" height="25" href="/" />
    <a-entity rotation = "30 -18 -18">
      <Image name="cow" {...polarToCart(160, 127)} width="30" height="30" href="/schedule" />
    </a-entity>
    <a-entity rotation = "40 0 0">
        <Image name="car" {...polarToCart(18, 98)} width="21" height="21" href="/hotels" />
    </a-entity>


    <a-entity  {...polarToCart(-90, 73.5, rad+4, 20)} geometry="primitive: plane; width: 44; height: 27" material="shader:flat; opacity: .5; color: #FFF6F6" />
    <Text {...polarToCart(-90, 65, rad+3, 20)} noGeom={true} value={
          `Expected Weather: TBD

Wedding will be outdoors.
Dress code is semi-formal, but comfortable.

Please try and avoid bright/rich purples, super bold colors, or ivory/silver as to not
clash with the wedding colors. \
`
      } width="35" align="center" color="black" wrapCount="80" />
  </a-entity>
}

let RSVP = () => {
}

class Application extends React.Component {
  state = {
    sky: 0
  }

  componentDidMount() {
    AFRAME.registerComponent('text-click', {
      init: function() {
        this.el.addEventListener('click', (function() {
          if (this.el._onClick) {
            this.el._onClick()
          }
        }).bind(this));
      }
    });

    //document.querySelector('a-scene').renderer.vr.enabled = false;
    //document.querySelector('a-camera').object3D.resetPerspectiveCamera();
  }

  render() {
    let skyName = all_skies[this.state.sky];
    let sky = skies[skyName];
  //          <img id="cowgif" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FcowGIF.gif?1546396382863" />
// <img id="cowpic" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCow1.2.png?1546226445276" />
//           <img id="housepic" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FHouse1.2.png?1546384900761" />
//           <img id="carpic" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCar1.1.png?1546385282942" />
//           <img id="catpic" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCat1.png?1546384900179" />
//          {_.map(skies, (v, k) => <img key={k} id={k} crossOrigin="anonymous" src={v.path} />)}

    return <ReactRouterDOM.HashRouter>
      {AFRAME.utils.device.isMobile()
        ? <div>
          <img src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FLogo.png?1546490561847" style={{width: "100%", filter: "invert(100%)", margin: "auto"}} />
          <p style={{textAlign: "center", fontSize: "20px"}}>Please visit this page on your laptop or desktop for the proper experience.</p>
        </div>
        : <a-scene cursor="rayOrigin: mouse">

          <a-assets>
            <img id="cow1" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCow-1_1.png?" />
            <img id="cow2" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCow-2-1.png?" />
            <img id="cow3" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCow-3_1.png?" />

            <img id="cat1" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCat-1.png?1546759467288" />
            <img id="cat2" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCat-2.png?1546759467288" />
            <img id="cat3" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCat-3.png?1546759467288" />

            <img id="house1" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FHouse-1.png?" />
            <img id="house2" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FHome-2.png?" />
            <img id="house3" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FHouse-3.png?" />

            <img id="car1" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCar-1.png?" />
            <img id="car2" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCar-2.png?" />
            <img id="car3" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCar-3.png?" />

            <img id="logo" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FLogo.png?1546490561847" />
            <img id="pan" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FPanIcon.png?1546576530465" />
            <img id="click" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FClick.png?1546756704586"/>
            <img id="stars" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FStar.png?1546757865536"/>

          </a-assets>

          <a-entity id="cameraWrapper"><a-camera></a-camera></a-entity>

          <ReactRouterDOM.Route path="/" exact component={Home} />
          <ReactRouterDOM.Route path="/schedule" component={Schedule} />
          <ReactRouterDOM.Route path="/hotels" component={Hotels} />
          <ReactRouterDOM.Route path="/dress" component={Dress} />
      </a-scene>}
    </ReactRouterDOM.HashRouter>
  }
}

ReactDOM.render(
  <Application />,
  document.getElementById('container')
)

/*

//////////HOME//////////

Save the Date!
RSVP (under that ^)

text:
When: August 31, 2019
Where: Rutledge, Georgia
////////////////////////

/////////SCHEDULE////////

Location: To be announced
(Need detailed directions regarding gate + drive in forest
up to house)
Caterer: To be announced

Wedding Schedule
4:30pm - 5:00pm Guest arrival
5:00pm - 5:30pm Ceremony

Dinner
5:45pm - 7:30pm Reception

Gifts
Hmmmmm

/////////////////////////

/////////HOTELS//////////

Accommodations: To be accounced

Hampton Inn (link) - Directions to house
La Quinta (link) - Directions to house
Travelodge (link) - Directions to house

Once responses are in, we will share a list for guests to
coordinate carpooling.
/////////////////////////


/////////DRESS//////////
Expected Weather: ??
General: Semi-formal clothing, but comfortable. Wedding will be outdoors on the grass.

Please try and avoid bright/rich purples, super bold colors, or ivory/silver
as to not clash with the wedding colors. If you have questions about what to wear,
feel free to email Maryyann.



mlandlor@gmail.com
///////////////////////


*/
