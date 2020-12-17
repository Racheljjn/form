import React, { Component } from "react";
import "./App.css";
import axios from "axios";
import NumberFormat from "react-number-format";

let current_date = "2020-11-26";

class App extends Component {
  constructor() {
    super();
    this.state = {
      selected_fund_ID: "IGB",
      outdated_fund_data: {},
      updated_fund_data: {},
      date: "",
    };
  }

  handleFundSelection = (e) => {
    e.preventDefault();
    this.setState({ selected_fund_ID: e.target.value });
  };

  handleDateChange = (e) => {
    e.preventDefault();
    const updated_fund_data = { ...this.state.updated_fund_data };
    Object.keys(updated_fund_data).map((key) => {
      return (updated_fund_data[key].date = e.target.value);
    });
    this.setState({ date: e.target.value, updated_fund_data });
  };

  handleAUMChange = (e, name, fundID) => {
    e.preventDefault();
    const updated_fund_data = { ...this.state.updated_fund_data };
    updated_fund_data[fundID].aum = Number(
      e.target.value.replace(/[^0-9\.]+/g, "")
    );

    this.setState({
      [name]: e.target.value,
      updated_fund_data,
    });
  };

  handleNAVChange = (e, seriesID, selected_fund_ID) => {
    e.preventDefault();
    const updated_fund_data = { ...this.state.updated_fund_data };
    updated_fund_data[selected_fund_ID].series[seriesID] = Number(
      e.target.value.replace(/[^0-9\.]+/g, "")
    );
    this.setState({
      [e.target.name]: e.target.value,
      updated_fund_data,
    });
  };

  submitHandler = (e) => {
    e.preventDefault();
    let newObj = {};
    for (let fund_item in this.state.updated_fund_data) {
      if (
        this.state.updated_fund_data[fund_item].hasOwnProperty("aum") ||
        Object.keys(this.state.updated_fund_data[fund_item].series).length != 0
      ) {
        newObj[fund_item] = this.state.updated_fund_data[fund_item];
      }
    }
    if (Object.keys(newObj).length === 0) {
      alert("Can not submit empty form");
    } else {
      console.log(newObj);
      axios
        .post(`http://localhost/server/demo.php`, JSON.stringify(newObj))
        .then((res) => {
          if (res.status === 200) {
            alert("form submitted!");
          }
        })
        .catch((err) => {
          if (err) {
            alert("Oops, something went wrong! Maybe check your server...");
          }
        });
    }
  };

  /***************************
   fetch data and organize data
   ****************************/
  componentDidMount() {
    this.fetchData();
  }
  fetchData = async () => {
    try {
      const result = await fetch(
        `https://purposecloud.s3.amazonaws.com/challenge-data.json`
      );
      const data = await result.json();

      const simplified_fund_data = {};

      for (let prop in data) {
        if (data.hasOwnProperty(prop)) {
          simplified_fund_data[prop] = {
            aum: data[prop].aum,
            name: data[prop].name.en,
            series: data[prop].series,
            date: "",
          };
          for (let key in data[prop].series) {
            if (data[prop].series.hasOwnProperty(key)) {
              simplified_fund_data[prop].date =
                data[prop].series[key].latest_nav.date;
              simplified_fund_data[prop].series[key] =
                data[prop].series[key].latest_nav.value;
            }
          }
        }
      }

      /**********************************
      filter out funds which are outdated
      ************************************/
      for (let id in simplified_fund_data) {
        if (simplified_fund_data.hasOwnProperty(id)) {
          if (
            new Date(simplified_fund_data[id].date).getTime() >
            new Date(current_date).getTime()
          ) {
            delete simplified_fund_data[id];
          }
        }
      }

      let updated_fund_data = JSON.parse(JSON.stringify(simplified_fund_data));
      Object.keys(updated_fund_data).map((key) => {
        return (updated_fund_data[key] = {
          series: {},
          name: simplified_fund_data[key].name,
        });
      });

      this.setState({
        updated_fund_data,
        outdated_fund_data: simplified_fund_data,
      });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const { outdated_fund_data, selected_fund_ID } = this.state;

    return (
      <div>
        <h1 className="title">
          out-of-date fund{" "}
          <span className="instructions">
            (please note*: red numbers are stale numbers)
          </span>
        </h1>
        <form id="updated_form" onSubmit={this.submitHandler}>
          <main className="date_fund_AUM">
            <section className="date_picker">
              <label htmlFor="date" aria-label="date">
                <span className="date_label">Date:</span>{" "}
              </label>
              <input
                type="date"
                min={current_date}
                id="date"
                name="date"
                onChange={this.handleDateChange}
                value={this.state.date}
              />
              <p className="outdated_date">
                {outdated_fund_data[selected_fund_ID]
                  ? outdated_fund_data[selected_fund_ID].date
                  : null}
              </p>
              <p className="current_fund">
                Current Fund: {this.state.selected_fund_ID}
              </p>
            </section>
            <section className="fund_AUM">
              <div className="fund">
                <label htmlFor="selection">Choose a fund:</label>
                <select
                  id="selection"
                  value={selected_fund_ID}
                  onChange={this.handleFundSelection}
                >
                  {Object.keys(outdated_fund_data).map((key, index) => {
                    return (
                      <option className="option" key={index} value={key}>
                        {outdated_fund_data[key].name}({key})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="AUM_data">
                {outdated_fund_data[selected_fund_ID]
                  ? Object.keys(outdated_fund_data).map((fundID) => {
                      if (fundID === selected_fund_ID) {
                        return (
                          <div className="AUM_label">
                            <label htmlFor="AUM">AUM: </label>

                            <NumberFormat
                              id="AUM"
                              thousandSeparator={true}
                              prefix={"$"}
                              displayType="number"
                              name={outdated_fund_data[selected_fund_ID].name}
                              value={
                                this.state[
                                  outdated_fund_data[selected_fund_ID].name
                                ]
                              }
                              onChange={(e) => {
                                this.handleAUMChange(
                                  e,
                                  outdated_fund_data[selected_fund_ID].name,
                                  fundID
                                );
                              }}
                            />
                            <p className="outdated_AUM">
                              {outdated_fund_data[fundID]
                                ? outdated_fund_data[fundID].aum.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                    }
                                  )
                                : null}
                            </p>
                          </div>
                        );
                      }
                    })
                  : null}
              </div>
            </section>
          </main>

          <ul>
            {outdated_fund_data[selected_fund_ID]
              ? Object.keys(outdated_fund_data).map((fundID) => {
                  if (fundID === selected_fund_ID) {
                    return Object.keys(outdated_fund_data[fundID].series).map(
                      (seriesID, index) => {
                        return (
                          <div className="series">
                            <li className="seriesID" key={index}>
                              Series: {seriesID} - NAV:
                            </li>
                            <NumberFormat
                              className="nav_input"
                              thousandSeparator={true}
                              prefix={"$"}
                              displayType="number"
                              name={`${fundID}_${seriesID}`}
                              value={this.state[`${fundID}_${seriesID}`]}
                              onChange={(e) => {
                                this.handleNAVChange(
                                  e,
                                  seriesID,
                                  selected_fund_ID
                                );
                              }}
                            />
                            <li className="outdated_NAV">
                              {" "}
                              $
                              {outdated_fund_data[fundID]
                                ? outdated_fund_data[fundID].series[seriesID]
                                : null}
                            </li>
                          </div>
                        );
                      }
                    );
                  }
                })
              : null}
          </ul>

          <div className="btn">
            <button type="submit" id="submit">
              submit
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default App;
