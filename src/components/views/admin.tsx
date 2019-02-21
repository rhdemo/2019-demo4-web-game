import { Component, h } from "preact";
import { connect, sendGameStateChange } from "@app/websocks/ws";
import { GameModes, GameModeEntry } from "@app/interfaces/admin";

export class AdminView extends Component <{}, AdminViewState> {
  constructor() {
    super();

    this.setState({
      activeGameMode: GameModes.Lobby
    })
  }

  async componentWillMount() {
    connect(true);
  }

  sendMessage(mode: GameModeEntry) {
    // Set component state
    this.setState({ activeGameMode: mode })

    sendGameStateChange({ state: mode.text });
  }

  render() {
    const modes = Object.keys(GameModes)
    return (
      <div>
        <h1>Admin View</h1>

        {Object.keys(GameModes).map((key) => {
          return (
            <button onClick={() => this.sendMessage(GameModes[key])}>
              {key} { this.state.activeGameMode === GameModes[key] ? (<span>(active)</span>) : (<span></span>)}
            </button>
          );
        })}
      </div>
    );
  }
}

interface AdminViewState {
  activeGameMode: GameModeEntry
}
