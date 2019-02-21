import { Component, h } from "preact";
import { connect, sendGameStateChange } from "../../websocks/ws";

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

  async componentWillMount() {
    connect(true);
  }

  sendMessage(state) {
    sendGameStateChange({ state: state });
  }

  render() {
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
