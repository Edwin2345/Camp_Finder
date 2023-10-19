const cities = require("./cities");
const {descriptors, places} = require("./seedHelpers")
import { Schema, model, connect, disconnect } from 'mongoose';
const Campground = require("../models/campground")


//MONGO CONNECTION
main().catch( e =>  console.log(e));

async function main(){

  await connect('mongodb://127.0.0.1:27017/campDB')
  console.log("Database Connection OPENED!")

}

function randElement(arr: string[]): string{
   return arr[Math.floor(Math.random()*arr.length)];
}


async function seedDB(){
    //clear all previous entries
    await Campground.deleteMany({});

    for (let i=0; i<50; ++i){
        const randCityNum = Math.floor(Math.random()*1000);
        const randPrice = Math.floor(Math.random()*100);
        const camp = new Campground({
            title: `${randElement(descriptors)} ${randElement(places)}`,
            location: `${cities[randCityNum].city}, ${cities[randCityNum].state}`,
            image: "https://random.imagecdn.app/700/500",
            price: randPrice,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero quae ab quia. Alias nihil asperiores totam est beatae, sed, vitae eum, commodi quae esse quidem inventore illo. Neque, sapiente eos?"
        })
        await camp.save();
        console.log(camp);
    }
}

seedDB()
.then(() => {disconnect()} )
.catch( (e) => console.log(e))