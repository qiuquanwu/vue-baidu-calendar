import BaiduCalendar from './dist/bundle.esm.js'
import "./dist/index.css"
export {
    BaiduCalendar
}
const install=(app)=>{
    app.component('BaiduCalendar',BaiduCalendar)
}
export default {
    install
}