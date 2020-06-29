import React from 'react';
import ReactDOM from 'react-dom';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory';
import _ from 'lodash'
import currentWeekNumber from 'current-week-number'

class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      data: []
    };
  }

  tick() {
    const stateKey = _.sample(this.keys)
    console.log(stateKey)
    this.setState({key: stateKey})
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }
  
  setKeys( keys ) {
    this.keys = keys
  }

  componentDidMount() {
    fetch("https://data.cdc.gov/resource/r8kw-7aab.json")
      .then(res => res.json())
      .then(
        (result) => {
          const data = {}
          
          _.forEach(result, function(item) {
            if (!data[item["state"]]) {
              data[item["state"]] = [ item ]
              console.log(item["state"])
            } else {
              data[item["state"]].push(item)
            }
            item.x = Number(currentWeekNumber(item["start_week"]))
            item.y = Number(item["covid_deaths"]) || 0
          });
          this.setKeys(Object.keys(data))

          this.setState({
            isLoaded: true,
            data: data,
            key: "United States"
          });
          this.timerID = setInterval(
            () => this.tick(),
            5000
          );
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    const { error, isLoaded, data, key } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <VictoryChart 
          theme={VictoryTheme.material}
          style={{
            parent: {
              border: "1px solid #ccc"
            }
           }}
           responsive={false}
           >
        <VictoryLine data={data[key]}/>  
        <VictoryAxis
          label="Week Number"
          style={{
            axisLabel: { padding: 30 }
          }}
        />
        <VictoryAxis dependentAxis
          label={ `COVID 19 Deaths in ${key}` }
          style={{
            axisLabel: { padding: 35}
          }}
        />
        </VictoryChart>
      );
    }
  }
}

class Main extends React.Component {

  render() {
    return (
      <div className="data" style={{width: 650 + 'px'}} >
        <Chart/>
      </div>
    );
  }
}

const app = document.getElementById('app');

ReactDOM.render(<Main />, app);