async function main() {
  const url = "https://site.api.espn.com/apis/site/v2/sports/soccer/col.1/scoreboard";
  const res = await fetch(url);
  const data = await res.json();
  
  console.log(`Eventos encontrados: ${data.events?.length}`);
  if (data.events && data.events.length > 0) {
    for (const event of data.events) {
      const match = event.competitions[0];
      const status = match.status.type.name;
      const homeTeam = match.competitors.find((c: any) => c.homeAway === 'home');
      const awayTeam = match.competitors.find((c: any) => c.homeAway === 'away');
      
      console.log(`\nPartido: ${homeTeam.team.name} vs ${awayTeam.team.name}`);
      console.log(`Estado: ${status}`);
      console.log(`Marcador: ${homeTeam.score} - ${awayTeam.score}`);
      
      if (match.details) {
        console.log("Detalles (Goles):");
        for (const detail of match.details) {
          if (detail.scoringPlay && detail.type.text === 'Goal') {
            const team = detail.team.displayName;
            const player = detail.participants?.[0]?.athlete?.displayName;
            console.log(` - ${player} (${team}) al minuto ${detail.clock.displayValue}`);
          }
        }
      }
    }
  }
}

main().catch(console.error);
