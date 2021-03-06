import * as React from 'react';
import Board from './Board';
import VideoArea from './VideoArea';
import {
  StoreState,
  MatchInfo,
  GameSpec,
  UserIdToInfo,
  CSSPropertiesIndexer,
  RouterMatchParams
} from '../types/index';
import { connect } from 'react-redux';
import { History } from 'history';
import { getOpponents, findMatch } from '../globals';
import { videoChat } from '../services/videoChat';
import RaisedButton from 'material-ui/RaisedButton';
import Chip from 'material-ui/Chip';
import PersonAdd from 'material-ui/svg-icons/social/person-add';

interface PlayingScreenProps {
  myUserId: string;
  userIdToInfo: UserIdToInfo;
  matchInfo: MatchInfo;
  gameSpec: GameSpec;
  match: RouterMatchParams;
  history: History;
}

const styles: CSSPropertiesIndexer = {
  playingScreenContainer: {
    overflow: 'auto'
  },
  inviteFriendBtn: {
    margin: 10
  },
  chip: {
    margin: 4
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  }
};

class PlayingScreen extends React.Component<PlayingScreenProps, {}> {
  state = {
    videoChatButton: false
  };
  render() {
    if (!this.props.matchInfo) {
      return <div>The matchId doesn't exist.</div>;
    } else if (!this.props.gameSpec) {
      let gameSpecScreenShot = this.props.matchInfo!.game.screenShot
        .downloadURL;
      let screenShotWidth = this.props.matchInfo!.game.screenShot.width;
      let screenShotHeight = this.props.matchInfo!.game.screenShot.height;
      const ratio = window.innerWidth / screenShotWidth;
      document.getElementById('loadingSpinner')!.style.display = 'block';
      return (
        <>
          <div style={styles.playingScreenContainer}>
            <img
              height={screenShotHeight * ratio}
              width={screenShotWidth * ratio}
              src={gameSpecScreenShot}
            />
          </div>
        </>
      );
    }

    document.getElementById('loadingSpinner')!.style.display = 'none';
    const participantsUserIds = this.props.matchInfo!.participantsUserIds;
    const opponents = getOpponents(
      participantsUserIds,
      this.props.myUserId,
      this.props.userIdToInfo
    );

    const showVideoArea =
      opponents.length >= 1 &&
      videoChat.isSupported() &&
      this.state.videoChatButton;
    console.log('showVideoArea=', showVideoArea, 'opponents=', opponents);
    const videoArea = !showVideoArea ? null : (
      <VideoArea opponents={opponents} />
    );
    const inviteFriend =
      this.props.matchInfo!.participantsUserIds.length > 1 ? (
        <RaisedButton
          onClick={() => {
            this.setState({
              videoChatButton: !this.state.videoChatButton
            });
          }}
          label={
            this.state.videoChatButton
              ? 'Stop VideoChatting'
              : 'Start VideoChatting'
          }
          primary={true}
        />
      ) : (
        <RaisedButton
          onClick={() => {
            this.props.history.push(
              '/contactsList/' + this.props.matchInfo!.matchId
            );
          }}
          label="Invite a friend to play"
          style={styles.inviteFriendBtn}
          icon={<PersonAdd />}
          primary={true}
        />
      );
    const opponentsArea = this.state.videoChatButton ? null : (
      <div style={styles.wrapper}>
        {opponents.map(opponent => (
          <Chip key={opponent.userId} style={styles.chip}>
            {opponent.name}
          </Chip>
        ))}
      </div>
    );
    return (
      <div style={styles.playingScreenContainer}>
        <Board
          matchInfo={this.props.matchInfo!}
          gameSpec={this.props.gameSpec}
        />
        {inviteFriend}
        {opponentsArea}
        {videoArea}
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState, ownProps: PlayingScreenProps) => {
  let matchInfo: MatchInfo | undefined = findMatch(
    state.matchesList,
    ownProps.match.params.matchIdInRoute
  );
  let gameSpec: GameSpec | undefined;
  if (matchInfo) {
    gameSpec = state.gameSpecs.gameSpecIdToGameSpec[matchInfo.gameSpecId];
  }
  return {
    matchInfo: matchInfo,
    gameSpec: gameSpec,
    myUserId: state.myUser.myUserId,
    userIdToInfo: state.userIdToInfo
  };
};

export default connect(mapStateToProps)(PlayingScreen);
