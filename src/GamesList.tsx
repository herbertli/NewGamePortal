import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import { GridList, GridTile } from 'material-ui/GridList';
import spec from './spec';

const styles: any = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500,
    height: 450,
    overflowY: 'auto',
  },
};

console.log('Our db: ', spec.gameBuilder.gameSpecs['-KxLz3CaPRPIBc-0mRP7']);

const images = [
  '3 Men Chess',
  'Checkers',
  'Five in a row',
  'Alquerque',
  'Chess',
  'Game_of_Y',
  'Blue Nile',
  'Dvonn',
  'Chaturanga',
  'Emergo',
];

const tilesData = images.map((img)=>{
  return {
    img: require(`./images/${img}.png`),
    title: img,
  };
});

/**
 * TODOS:
 * 1. Move this to components folder
 * 2. Wrap this in a redux container which gets gameslist as props with required information
 * 3. Add componentDidMount function to component
 * 4. In componentDidMount dispatch an action for fetching list which will change the storestate's
 * list of games through a reducer. This will ultimately lead to a rerender of this component
 * with games. For now use the game list from hardcoded information
 * 5. onClick of any of the grid tile dispatch an action which changes the currently selected game
 * and reroutes to that game's route.
 */
class GamesList extends React.Component {
  render() {
    return (
      <div>
        <RaisedButton label="Default" />
        {<div style={styles.root}>
          <GridList
            cellHeight={180}
            style={styles.gridList}
          >
            <Subheader>Card games</Subheader>
            {tilesData.map((tile) => (
              <GridTile
                key={tile.img}
                title={tile.title}
                subtitle={''}
                actionIcon={<IconButton><StarBorder color="white" /></IconButton>}
              >
                <img src={tile.img} />
              </GridTile>
            ))}
          </GridList>
        </div>}
      </div>
    );
  }
}

export default GamesList;