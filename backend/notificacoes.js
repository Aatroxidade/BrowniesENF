const cron =
require("node-cron");

cron.schedule(

"0 10 * * 1",

async ()=>{

console.log(
" Rodando notificações"
);

}

);