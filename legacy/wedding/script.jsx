let MOBILE = AFRAME.utils.device.checkHeadsetConnected();
let all_skies = ['path', 'cow', 'hands', 'farm', 'bagfeet']
let skies = {
  cow: {
    path: "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCow.jpg?1547019350915",
    rotation: "0 110 10"
  },
  path: {
    path: "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2Fpath.jpg?1547019350156",
    rotation: "4 93 -2"
  },
  hands: {
    path: "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2Fhands.jpg?1547019352385",
    rotation: "0 86 15"
  },
  farm: {
    path: "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2Ffarm.jpg?1547019349220",
    rotation: "40 20 10"
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

    let hoverEvent = {
      'event-set__down': "_event: mousedown; color: #A4377C",
      'event-set__enter': "_event: mouseenter; color: #DD78B8",
      'event-set__leave': `_event: mouseleave; color: ${this.props.color || 'white'}`
    }

    return <a-image ref={this.el} text-click {...this.props} {...hoverEvent} src={url} onClick={() => {
        if (!MOBILE) {
          let el = document.getElementById('cameraWrapper');
          let camRot = el.querySelector('[camera]').getAttribute('rotation');
          el.setAttribute('rotation', {
            y: -1 * camRot.y})
        }

        window.location = `/wedding/#${this.props.href}`;
      }} ></a-image>;
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
      {first_view ? null:
        <Image name="cow" {...polarToCart(-55, 90)} color = "pink" width="15" height="15" href="/schedule" />}
      {first_view ? null:
        <Image name="car" {...polarToCart(-143, 100)} color = "#FFBF00" width="13" height="13" href="/hotels" />}
      {first_view ? null:
        <Image name="cat" {...polarToCart(-128, 110)} color = "#00FFDF" width="15" height="15" href="/dress" />}

      {first_view ? null:
      <a-image src = "#click" color = "#D166FF" {...polarToCart(-43, 85, rad+3)} width="10" height="10"></a-image>}
      {first_view ? null:
      <a-image src = "#click" color = "#D166FF" {...polarToCart(-130, 97, rad+3)} width="12" height="12"></a-image>}



      <a-image {...polarToCart(-90, 70)} src="#logo" width="60" height="40"></a-image>
      {first_view ?
        <a-image id = "panLogo" {...polarToCart(-90, 107)} src="#pan" width="30" height="23" material={first_view ? "opacity:1" : "opacity:0"}>
          <a-animation attribute="material.opacity" begin="fade" to="0" dur = "1000"></a-animation>
        </a-image> : null}


      <Text {...polarToCart(25, 60, rad+10)} value= "Save the Date!" width="150" align="center" color="#D166FF" font={fonts.dancingscript} />
      <Text {...polarToCart(25, 67,rad+15)} value="When: September 1, 2019\nWhere: Rutledge, Georgia" color="white" width="80" align="center" />
      {first_view ? null:
        <a-image {...polarToCart(-81, 100)} src ="#rsvp" width="13" height = "9"
        event-set__enter = "_event: mouseenter; color: #DD78B8"
        event-set__leave = "_event: mouseleave; color: white"
        onClick={() => { window.location = "https://goo.gl/forms/VyNIZGO1r19q2tpS2"; }}/>
        }
      {first_view ? null:
        <Text {...polarToCart(-81, 95)} value = "Reply By: 2.10.2019" width = "25" align = "center" color = "white"/>
      }

      <a-image src = "#singleCow" {...polarToCart(0, 85, rad+3)} width="10" height="10" material = "opacity:0.5" ></a-image>
      <a-image src = "#singleCow" {...polarToCart(0, 90, rad)} scale = "-1 1 1" width="15" height="15"></a-image>
      <a-image src = "#singleCow" {...polarToCart(20, 87, rad-2)} scale = "-.7 1 1" width="12" height="12"material = "opacity:0.7"></a-image>
      <a-image src = "#singleCow" {...polarToCart(40, 87, rad)} width="9.5" height="9.5"material = "opacity:0.5"></a-image>
      <a-image src = "#singleCow" {...polarToCart(80, 90, rad)} width="14" height="14"></a-image>
      <a-image src = "#singleCow" {...polarToCart(100, 93, rad)} width="15" height="15"></a-image>
      <a-image src = "#singleCow" {...polarToCart(135, 93, rad+2)} scale = "-1 1 1" width="10" height="10" material = "opacity: 0.7"></a-image>
      <a-image src = "#singleCow" {...polarToCart(144, 95, rad)} scale = "-1 1 1" width="12" height="12" material = "opacity: 0.8"></a-image>

      {first_view ? null:
        <a-image src = "#sign1" {...polarToCart(-35, 105)} width="9" height="9" ></a-image>}

       {first_view ? null:
        <a-image src = "#locSign" {...polarToCart(-38, 92)} width="11" height="11" ></a-image>}

    </a-entity>
  }
}

let Schedule = () => {
  return <a-entity>
      <Sky skyName="cow" />
      <Text {...polarToCart(-90, 67)} value="Schedule" width="200" align="center" color="pink" />

      <Image name="house" {...polarToCart(-40, 80)} color = "#D166FF" width="17" height="17" href="/" />
      <Image name="cat" {...polarToCart(100, 100,rad+10)} color = "#00FFDF" width="20" height="20" href="/dress" />
      <Image name="car" {...polarToCart(200, 100)} color = "#FFBF00" width="23" height="23" href="/hotels" />

    <Text {...polarToCart(-125, 95)} value = "Reply By: 2.10.2019" width = "25" align = "center" color = "white"/>
    <a-image {...polarToCart(-125, 100)} src ="#rsvp" width="11" height = "7"
        event-set__enter = "_event: mouseenter; color: #DD78B8"
        event-set__leave = "_event: mouseleave; color: white"
        onClick={() => { window.location = "https://goo.gl/forms/VyNIZGO1r19q2tpS2"; }}/>

    <a-image src = "#sign2" {...polarToCart(-60, 100)} width="13" height="13" ></a-image>

      <a-image src = "#singleCow" {...polarToCart(20, 93, rad-2)} scale = "-.7 1 1" width="12" height="12"material = "opacity:0.7"></a-image>
      <a-image src = "#singleCow" {...polarToCart(50, 100, rad-2)} scale = "1 1 1" width="13" height="13"></a-image>
      <a-image src = "#singleCow" {...polarToCart(165, 97, rad)} scale = "-1 1 1" width="10" height="10" material = "opacity:0.7" ></a-image>


      <a-entity  {...polarToCart(-90, 77, rad+15)} geometry="primitive: plane; width: 55; height: 20" material="shader:flat; opacity: .3; color: #FFF6F6" />
      <Text {...polarToCart(-90, 80,rad+1)} noGeom={true} value={
        `4:00-5:00pm - Guests arrive
5:00-5:30pm - Ceremony
5:30-7:30pm - Reception`
} width="60" align="center" color="black" baseline="center" />


      <a-entity  {...polarToCart(230, 82, rad+15)} geometry="primitive: plane; width: 23; height: 10" material="shader:flat; opacity: .3; color: #FFF6F6" />
      <Text {...polarToCart(230, 84,rad+10)} noGeom={true} value={
          `Updates: TBD!`
      } width="60" align="center" color="black" />
      <Text {...polarToCart(230, 75,rad+15)} value="Gifts" color = "pink" width="130" align="center"  />

  </a-entity>
}

let Hotels = () => {
   // <Text {...polarToCart(80, 70)} noGeom={true} value={
   //        `
   //        Cost: $100/night`
   //    } width="100" align="center" color="black" />
  return <a-entity>
    <Sky skyName="hands" />
    <Text {...polarToCart(-90, 59, rad+15)} value="Hotels" color = "#FFBF00" width="130" align="center" />
      <a-entity rotation = "0 0 20">
        <Image name="house" color = "#D166FF" {...polarToCart(225, 60)} width="20" height="20" href="/" />
      </a-entity>
      <a-entity rotation = "11 0 0 ">
         <Image name="cow" color = "pink" {...polarToCart(183, 87)} width="17" height="17" href="/schedule" />
      </a-entity>

      <a-entity rotation = "15 0 0">
        <Image name="cat" color = "#00FFDF" {...polarToCart(-40, 90)} width="20" height="20" href="/dress" />
      </a-entity>

    <Text {...polarToCart(-112, 92)} value = "Reply By: 2.10.2019" width = "25" align = "center" color = "white"/>
    <a-image {...polarToCart(-112, 97)} src ="#rsvp" width="11" height = "7"
        event-set__enter = "_event: mouseenter; color: #DD78B8"
        event-set__leave = "_event: mouseleave; color: white"
        onClick={() => { window.location = "https://goo.gl/forms/VyNIZGO1r19q2tpS2"; }}/>


    <a-image src = "#stars" {...polarToCart(8, 90)}  width="15" height="15"></a-image>
    <a-image src = "#stars" {...polarToCart(130, 100)}  width="15" height="15"></a-image>
    <a-image src = "#stars" {...polarToCart(80, 95)} width="25" height="25"></a-image>

    <a-entity  {...polarToCart(-90, 70, rad+7)} geometry="primitive: plane; width: 50; height: 23" material="opacity: 0.5; color: white" />
    <Text {...polarToCart(-90, 63)} value={"Accomodations: TBD"} width="60" align="center" color="white"/>
    <Text {...polarToCart(-90, 70, rad+2)} geomWidth = "20" geomHeight = "3" value={"Hampton Inn"} width="65" align="center" color="white" onClick={() => {
        window.location = 'https://hamptoninn3.hilton.com/en/hotels/georgia/hampton-inn-covington-ATLCVHX/index.html'
      }}
      event-set__enter = "_event: mouseenter; color: #DD78B8"
      event-set__leave = "_event: mouseleave; color: white"
      />
    <Text {...polarToCart(-90, 75, rad +1)} geomWidth = "20" geomHeight = "3" value={"La Quinta"} width="65" align="center" color="white" onClick={() => {
        window.location = 'https://www.lq.com/en/hotels/louisiana/covington/0866'
      }}
      event-set__enter = "_event: mouseenter; color: #DD78B8"
      event-set__leave = "_event: mouseleave; color: white"
      />
    <Text {...polarToCart(-90, 80)} geomWidth = "20" geomHeight = "3" value={"Travelodge"} width="65" align="center" color="white" onClick={() => {
        window.location = 'https://www.wyndhamhotels.com/travelodge/covington-georgia/travelodge-covington/overview'
      }}
      event-set__enter = "_event: mouseenter; color: #DD78B8"
      event-set__leave = "_event: mouseleave; color: white"
      />
    <a-image src = "#click" {...polarToCart(-73, 74)} width="20" height="20"  color = "white" />
    <a-image src = "#sign3" {...polarToCart(-145, 110, rad+10)} width="9" height="9" ></a-image>

   </a-entity>
}

let Dress = () => {
  return <a-entity>
    <Sky skyName="farm" />
    <Text {...polarToCart(-90, 60, rad+10)} value="Attire" width="130" align="center" color = "#00FFDF" />


    <a-entity rotation = "50 0 0" >
      <Image name="house" color = "#D166FF"  {...polarToCart(-50, 115, rad+5)} width="18" height="18" href="/" />
    </a-entity>

    <a-entity rotation = "30 -18 -18">
      <Image name="cow"  color = "pink" {...polarToCart(160, 127)} width="30" height="30" href="/schedule" />
    </a-entity>
    <a-entity rotation = "40 0 0">
        <Image name="car" color = "#FFBF00" {...polarToCart(18, 98)} width="21" height="21" href="/hotels" />
    </a-entity>

    <Text {...polarToCart(-105, 95)} value = "Reply By: 2.10.2019" width = "25" align = "center" color = "white"/>
    <a-image {...polarToCart(-105, 100)} src ="#rsvp" width="11" height = "7"
        event-set__enter = "_event: mouseenter; color: #DD78B8"
        event-set__leave = "_event: mouseleave; color: white"
        onClick={() => { window.location = "https://goo.gl/forms/VyNIZGO1r19q2tpS2"; }}/>


    <a-entity  {...polarToCart(-90, 73.5, rad+3, 20)} geometry="primitive: plane; width: 44; height: 27" material="shader:flat; opacity: .5; color: #FFF6F6" />
    <Text {...polarToCart(-90, 65, rad+3, 20)} noGeom={true} value={
          `Expected Weather: TBD

Wedding will be outdoors.
Dress code is semi-formal, but comfortable.

Please try and avoid bright/rich purples, super bold colors, or ivory/silver as to not
clash with the wedding colors. \
`
      } width="35" align="center" color="black" wrapCount="80" />
    <a-entity rotation = "35 0 0" >
    <a-image src = "#sign3" {...polarToCart(-140, 110, rad)} width="12" height="12" ></a-image>
    </a-entity>


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
            <img id="cow1" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCow-1.png?1547019480646" />
            <img id="cow2" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCow-2.png?1547019480805" />
            <img id="cow3" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCow-3.png?1547019481057" />

            <img id = "singleCow" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCow1.2.png?1546226445276"/>

            <img id="cat1" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCat-1.png?1547019480031" />
            <img id="cat2" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCat-2.png?1547019480251" />
            <img id="cat3" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCat-3.png?1547019480445" />

            <img id="house1" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FHouse-1.png?1547019484363" />
            <img id="house2" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FHouse-2.png?1547019484415" />
            <img id="house3" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FHouse-3.png?1547019484315" />

            <img id="car1" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCar-1.png?1547019482939" />
            <img id="car2" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCar-2.png?1547019483724" />
            <img id="car3" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FCar-3.png?1547019483002" />

            <img id="logo" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FLogo.png?1547019481489" />
            <img id="pan" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FPanIcon.png?1547019479736" />
            <img id="click" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FclickMe.png?1547019479597"/>
            <img id="stars" crossOrigin="anonymous" src="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2Fstars.png?1547019479908"/>
            <img id="rsvp" crossOrigin="anonymous" src = "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2Frsvp.png?1547019481778"/>
            <img id="sign1" crossOrigin="anonymous" src = "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2Fsign1.png?1547019482035"/>
            <img id="sign2" crossOrigin="anonymous" src ="https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2Fsign2.png?1547019482213"/>
            <img id = "sign3" crossOrigin="anonymous" src = "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2Fsign3.png?1547019483670"/>
            <img id = "locSign" crossOrigin="anonymous"  src = "https://cdn.glitch.com/d6ceb430-fa89-401d-811c-bc27ad01ce99%2FLocSign.png?1547019481311"/>

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
