import React, { Component } from 'react';
import axios from 'axios'

class App extends Component {
  constructor(){
    super()
    this.state={
      outdated:[],
      date:"",
    }
  }
  
  handleDateChange=(e)=>{
    e.preventDefault()
    this.setState({date: e.target.value})

  }

  handleAUMChange=(e)=>{
    e.preventDefault()
    this.setState({
      [e.target.name]:Number(e.target.value.trim())
    })

  }
  handleNAVChange=(e)=>{
  e.preventDefault()
    this.setState({
      [e.target.name]:Number(e.target.value.trim())
    })
  }

  submitHandler=(e)=>{
    e.preventDefault()
    let newObj = {...this.state}
    delete newObj.outdated;
    // newObj = { date: "2020-11-27", IGB: "30", IGB_A: "20", IGB_B: "10", MJJ: "60", MJJ_A: "30", MJJ_F: "20" }
    axios.post(`http://localhost/server/demo.php`, JSON.stringify(newObj))
    .then(res=>console.log(res))
    .catch(err=>{
      console.log(err)
    })

  }




// fetch data from json file
  componentDidMount(){
    this.fetchData()
  
  }


  fetchData = async() =>{
    let currentDate = "2020-11-26"
  try{

     const result = await fetch(`https://purposecloud.s3.amazonaws.com/challenge-data.json`)
      const data = await result.json()
      // refactoring data
      const allArray = Object.entries(data)
  
      const newAllArray = allArray.map(item =>{
        
        return [item[0], item[1].name, item[1].series,  item[1].aum]
      })

      let outdated = newAllArray.filter(item =>{
        return Object.entries(item[2]).every(piece=> {return new Date(piece[1].latest_nav.date).getTime() < new Date(currentDate).getTime() ? piece : null})

      } ).filter(item => item.length > 0)

      outdated = outdated.map(fund => {
       return [fund[0], Object.keys(fund[2]),fund[1].en ]
      })

      this.setState({outdated})
      
   

  }catch(err){
    console.log(err)
  }


  }

  // fetch data ends

  render() {
    const {outdated} = this.state
    return (
      
      <form onSubmit={this.submitHandler}>
        
        <input type="date" id="date" name="date" onChange={this.handleDateChange} value={this.state.date} placeholder="type new date" required/>
        <button type="submit">submit</button>
        {
          outdated.map((item,index) =>{
            return <div>
                  <p>{`${item[2]}-${item[0]}`}</p>
                  <input type="number" step="any" name={item[0]} onChange={this.handleAUMChange}  value={this.state.index} placeholder="type new aum"/>
                  
                   <ul>
                    
                    {item[1].map((n,key) => {
                    return <div>
                       <li key={key}>{n}</li>
                       <input type="number" step="any" value={this.state.key} onChange={this.handleNAVChange} name={`${item[0]}__${n}`} placeholder="type new nav" />
                    </div>})}                   
                    </ul>                  
              </div>
          })
        }


      </form>
    )
  }
}

export default App;


