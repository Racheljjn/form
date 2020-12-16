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
      date: "",
      outdated_fund_data: {},
      original_fund_data: {},
      input_data: {},
    };
  }

  handleFundSelection = (e) => {
    e.preventDefault();
    this.setState({ selected_fund_ID: e.target.value });
  };

  handleDateChange = (e) => {
    e.preventDefault();
    const outdated_fund_data = { ...this.state.outdated_fund_data };
    const input_data = { ...this.state.input_data };
    input_data["date"] = e.target.value;
    // Object.keys(outdated_fund_data).map((key) => {
    //   return (outdated_fund_data[key].date = e.target.value);
    // });
    this.setState({ date: e.target.value, outdated_fund_data, input_data });
  };

  handleAUMChange = (e, name, fundID) => {
    e.preventDefault();
    const outdated_fund_data = { ...this.state.outdated_fund_data };
    const input_data = { ...this.state.input_data };

    outdated_fund_data[fundID].aum = Number(
      e.target.value.replace(/[^0-9\.]+/g, "")
    );
    input_data[fundID].aum = Number(e.target.value.replace(/[^0-9\.]+/g, ""));

    this.setState({
      [name]: e.target.value,
      outdated_fund_data,
      input_data,
    });
    console.log(this.state.input_data);
  };
  handleNAVChange = (e, seriesID, selected_fund_ID) => {
    e.preventDefault();
    const outdated_fund_data = { ...this.state.outdated_fund_data };
    const input_data = { ...this.state.input_data };
    outdated_fund_data[selected_fund_ID].series[seriesID] = Number(
      e.target.value.replace(/[^0-9\.]+/g, "")
    );
    input_data[selected_fund_ID].series[seriesID] = Number(
      e.target.value.replace(/[^0-9\.]+/g, "")
    );
    this.setState({
      [e.target.name]: e.target.value,
      outdated_fund_data,
      input_data,
    });
    console.log(this.state.input_data);
  };

  submitHandler = (e) => {
    e.preventDefault();
    let newObj = { ...this.state.input_data };

    // newObj = { date: "2020-11-27", IGB: "30", IGB_A: "20", IGB_B: "10", MJJ: "60", MJJ_A: "30", MJJ_F: "20" }
    axios
      .post(`http://localhost/server/demo.php`, JSON.stringify(newObj))
      .then((res) => console.log(res))
      .catch((err) => {
        console.log(err);
      });

    this.successMsg();
  };

  // display a success msg once form's been submitted
  successMsg = () => {
    alert("form submitted successfully");
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
      console.log(simplified_fund_data);
      let outdated_fund_data = JSON.parse(JSON.stringify(simplified_fund_data));
      let input_data = JSON.parse(JSON.stringify(simplified_fund_data));
      Object.keys(input_data).map((key) => {
        return (input_data[key] = {
          series: {},
          name: outdated_fund_data[key].name,
          aum: undefined,
        });
      });
      console.log(input_data);
      this.setState({ outdated_fund_data });
      this.setState({ input_data });
      this.setState({ original_fund_data: simplified_fund_data });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const {
      outdated_fund_data,
      original_fund_data,
      selected_fund_ID,
      date,
    } = this.state;

    return (
      <div>
        <h1>out-of-date data</h1>

        <form id="updated_form" onSubmit={this.submitHandler}>
          <main className="date_fund_AUM">
            <section className="date">
              <div className="date_picker">
                <label htmlFor="date" aria-label="date">
                  <span className="date_label">Date:</span>{" "}
                </label>
                <input
                  type="date"
                  min={current_date}
                  id="date"
                  name="date"
                  onChange={this.handleDateChange}
                  value={date}
                />
                <p className="outdated_date">
                  {original_fund_data[selected_fund_ID]
                    ? original_fund_data[selected_fund_ID].date
                    : null}
                </p>
              </div>
              <p className="instructions">
                (please note* the red numbers are stale numbers)
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
                              {original_fund_data[fundID]
                                ? original_fund_data[fundID].aum.toLocaleString(
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
                              Series: {seriesID}
                            </li>
                            <NumberFormat
                              className="nav_input"
                              thousandSeparator={true}
                              prefix={"$"}
                              displayType="number"
                              name={`${fundID}_${seriesID}`}
                              value={this.state.index}
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
                              {original_fund_data[fundID]
                                ? original_fund_data[fundID].series[seriesID]
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
