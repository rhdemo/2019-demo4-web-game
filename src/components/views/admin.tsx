import { Component, h } from "preact";

export class AdminView extends Component {
  constructor() {
    super();

    this.setState({
      modes: {
        lobby: {
          text: "Lobby"
        },
        play: {
          text: "Play"
        },
        pause: {
          text: "Pause"
        },
        gameover: {
          text: "Game Over"
        }
      }
    });
  }
  //
  // componentWillMount () {
  //   const onConfigEvent = (config: WebSocketFrames.Config) => {
  //     this.setState({ mode: config.gameState })
  //   }
  //
  //   const onMotionEvent = (motion: MotionAndOrientationPayload) => {
  //     this.setState({ motion })
  //   }
  //
  //   emitter.on(ApplicationEventTypes.OrientationMotionEvents.Update, (e) => onMotionEvent(e))
  //   emitter.on(ApplicationEventTypes.WebSocketEvents.Config, (e) => onConfigEvent(e))
  // }

  sendMessage(state) {
    console.log(state);
  }

  render() {
    // let v: any
    //
    // switch (this.state.mode) {
    //   case WebSocketFrames.ConfigGameMode.Active:
    //     v = <GameActiveView/>
    //     break
    //   case WebSocketFrames.ConfigGameMode.Paused:
    //     v = <GamePausedView/>
    //     break
    //   case WebSocketFrames.ConfigGameMode.Stopped:
    //     v = <GameStoppedView/>
    //     break
    //   default:
    //     v = <GameBorkedView/>
    // }

    return (
      <div>
        <h1>Admin View</h1>
        {Object.keys(this.state.modes).map(key => {
          return (
            <button onClick={() => this.sendMessage(key)}>
              {this.state.modes[key].text}
            </button>
          );
        })}
      </div>
    );
  }
}
