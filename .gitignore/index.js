//Contantes
const Discord = require('discord.js')
const Bot = new Discord.Client()
var msg_niveau_avertissement = ['(avertissement de niveau 1)', '(avertissement de niveau 2)', '(avertissement de niveau 3)']
//Fin des constantes

//variables
var dispatcher;
var radio_plage;
var radio_plage_max = 3;
var texte_sondage
var reponses_sondage = new Array()
var liste_votants = new Array()
var sondage_date
var liste_vote = new Array()
var nombre_vote
Bot.login(process.env.TOKEN)

Bot.on('ready', () => {
    
Bot.user.setPresence({ game: { name: 'BAWA Games', type: 0 } });
console.log("Bot en ligne");
Bot.channels.find("name", 'console').send('je suis en ligne')

});

Bot.on('message', message => {
    var commande = "!";
if(message.channel.name == 'commandes')
{
    if (message.content == commande + 'test'){
        message.reply('test bot 123')
    }
    
    if (message.content.startsWith(commande + "game")){//change le jeu du bot
        if(is_admin() == false)
        {
            message.author.createDM("Vous n'êtes pas admin, vous ne pouvez pas accéder à cette commande.")
            return
        }
        supprimer_message()
        let jeu = message.content.split(' ')
        jeu.shift()
        jeu = jeu.join(' ')
        Bot.user.setPresence({ game: { name: jeu, type: 0 } });
        add_console()
      }

      if (message.content.startsWith(commande + "stop"))//déconnecte le bot
      {
          supprimer_message()
          add_console()
        arret_bot()
      }

      if (message.content.startsWith(commande + "avertissement")){
          var avr = message.content.split(';')
          avr.shift()
          avr.reverse()
          avr.shift()
          var niv = avr.join('')
          var why = message.content.split(';')
          why.shift()
          why.shift()
          why = why.join('')
          avertissement(why, niv)
          supprimer_message()
          add_console()
      }

      if (message.content.startsWith(commande + 'surnom'))
      {
          surnom = message.content.split(';')
          surnom.shift()
          surnom = surnom.join('')
          modifier_surnom(surnom)
      }

      if (message.content.startsWith(commande + 'exclure'))
      {
          if(is_admin() == false)
          {
              return
          }

          if(message.mentions.members.first().kickable){
          console.log(message.content)
          var raison = message.content.split(';')
          raison.shift()
          raison.join('')
          message.mentions.users.first().sendMessage('La production de BAWA Games a décidé de vous exclure du serveur Discord du studio pour la raison suivante: '+ raison + ', vous pouvez le réintégré en postulant à nouveau pour le/les postes que vous occupiez avant votre exclusion')
          message.mentions.members.first().kick('')
          supprimer_message()
          add_console()
        }
        else
        {
          message.author.sendMessage('Impossible de bannir la personne mantionnée (' + message.mentions.members.first().nickname +')')
        supprimer_message()
          add_console()
        }
      }

    if (message.content.startsWith(commande + 'ban'))
    {
        if(is_admin() == false)
        {
            return
        }
        
        message.mentions.members.first().ban('')
        supprimer_message()
        add_console()
    }

    if(message.content.startsWith(commande + 'radio.start'))//démarrer la radio
    {
        radio_plage = message.content.split(';')
        radio_plage.shift()
        radio_plage = radio_plage.join('')

        if (is_admin() == false)
        {
            return
        }

        supprimer_message()
        add_console()

        if(message.member.voiceChannel)
        {
            message.member.voiceChannel.join().then(connection => {
                dispatcher = connection.playArbitraryInput('http://testbotbg.000webhostapp.com/music/radio/' + radio_plage + '.mp3')
                //dispatcher = connection.playFile('./Musics/' + radio_plage + '.mp3')
                dispatcher.on('end', e => {
                        if(radio_plage < radio_plage_max)
                        {
                            radio_plage++
                        }
                        else
                        {
                            radio_plage = 0
                        }
                        Ecrire_channel('commandes', commande + 'radio.start;' + radio_plage, 0)
                });

            });
        }else{
            message.author.sendMessage('vous devez vous connecter à un salon vocal pour démarrer la radio')
        }
    }//fin de la lecture de la radio

    /*if(message.content.startsWith(commande + 'radio.next'))
    {
        if(radio_plage < radio_plage_max)
        {
            radio_plage++
        }
        else
        {
            radio_plage = 0
        }
        Ecrire_channel('commandes', commande + 'radio.start;' + radio_plage, 0)
    }*/



    if(message.content == commande + 'radio.pause')//mettre la radio en pause
    {
        if (dispatcher !== undefined)
        {
            dispatcher.pause()
        }
    }

    if(message.content == commande + 'radio.resume')//reprendre la radio
    {
        if (dispatcher !== undefined)
        {
            dispatcher.resume()
        }
    }
      

    if(message.content.startsWith(commande + 'role.add'))
    {
        var role = message.content.split(';')
        role.shift()
        role = role.join()
        modifier_role(role, true)
    }

    if(message.content.startsWith(commande + 'role.remove'))
    {
        var role = message.content.split(';')
        role.shift()
        role = role.join()
        modifier_role(role, false)
    }

    if (message.content.startsWith(commande + 'all'))
    {
        var msg = message.content.split(';')
        msg.shift()
        msg = msg.join('')
        msg_tlm(msg) 
    }

    if(message.content.startsWith(commande + 'sondage.texte'))
    {
        if(is_admin() == false)
        {
            return
        }

        texte_sondage = message.content.split(';')
        texte_sondage.shift()
        texte_sondage = texte_sondage.join('')
        supprimer_message()
        add_console()
    }

    if(message.content.startsWith(commande + 'sondage.réponses'))
    {
        if (is_admin() == false)
        {
            return
        }

        reponses_sondage = message.content.split(';')
        reponses_sondage.shift(';')
        liste_vote = []
        for (pas = 0; pas < reponses_sondage.length; pas++) {
            liste_vote.push('0')
        }
        supprimer_message()
        add_console()
    }

    if(message.content.startsWith(commande + 'sondage.date'))
    {
        if (is_admin() == false)
        {
            return
        }

        sondage_date = message.content.split(';')
        sondage_date.shift()
        sondage_date = sondage_date.join('')
        supprimer_message()
        add_console()
    }

    if(message.content.startsWith(commande + 'sondage.poste'))
    {
        if(is_admin() == false)
        {
            return
        }

        var response = reponses_sondage.toString()
        for (pas = 0; pas < reponses_sondage.length; pas++) {
            response = response.replace(',', ' / ')
        }

        supprimer_message()

        Ecrire_channel('sondages', "Un nouveau sondage est disponible, merci d'y répondre avant le " + sondage_date + '\nVoici le sujet du sondage:\n' + texte_sondage + '\nRéponses possibles: ' + response + '\nMerci de repecter les accents, les majuscules et les minuscules. Merci')
        /*Ecrire_channel('sondages', texte_sondage, 0)
        Ecrire_channel('sondages', 'Réponses possibles: ' + response, 0)*/
        liste_votants = []
        nombre_vote = 0
    }

    if(message.content.startsWith(commande + 'sondage.stop'))
    {
        supprimer_message()
        add_console()
        var msg = ''
        for (pas = 0; pas < reponses_sondage.length; pas++) {
            msg = 'Vote ' + pas + ': ' + reponses_sondage[pas] + ', nombre de vote(s): ' + liste_vote[pas] + ' (' + Math.round(liste_vote[pas] / nombre_vote * 100) + '%)'
            Ecrire_channel('résultats-votes', msg)
        }
        Ecrire_channel('résultats-votes', 'Nombres de votes: ' + nombre_vote + '\nPersonne(s) ayant voté: ')
        for (pas = 0; pas < liste_votants.length; pas++) {
            Ecrire_channel('résultats-votes', liste_votants[pas])
        }

    }

    if(message.content.startsWith(commande + 'inviter.mentions'))
    {
        if(message.member.voiceChannel)
        {
        msg_mention(message.member.nickname + ' vous invite à rejoindre le channel ' + message.member.voiceChannel.name + ' vous pouvez le rejoindre quand vous voulez :wink:')
        supprimer_message()
        add_console()
        }
        else
        {
            message.author.sendMessage('Vous devez rejoindre un salon vocal pour inviter des gens')
        }
    }

    if(message.content == commande + 'inviter.all')
    {
        if(message.member.voiceChannel)
        {
        msg_tlm(message.member.nickname + ' vous invite à rejoindre le channel ' + message.member.voiceChannel.name + ' vous pouvez le rejoindre quand vous voulez :wink:')
        supprimer_message()
        add_console()
        }
        else
        {
            message.author.sendMessage('Vous devez rejoindre un salon vocal pour inviter des gens')
        }
    }

    }//fin des commandes


    if(message.channel.name == 'sondages')
    {

        if(message.author.username == 'BAWA Assistance')
        {
            return
        }

        if(liste_votants.indexOf(message.author.username) !== -1)
        {
            message.author.sendMessage('Vous avez déjà voté.')
            return
        }

        if(reponses_sondage.indexOf(message.content) == -1 && message.author.username !== 'BAWA Assistance')
        {
            message.author.sendMessage('Votre vote ne figure pas dans la liste des votes possibles.')
            supprimer_message()
            return
        }

        var indx = reponses_sondage.indexOf(message.content)
        var new_val = liste_vote[indx]
        new_val++
        liste_vote.splice(indx, 1, new_val)
        liste_votants.push(message.author.username)
        nombre_vote++
        message.author.sendMessage('Votre vote à bien été pris en compte :wink:')
        supprimer_message()
    }


    if(message.channel.name == 'console')
    {
        if(message.author.username != Bot.user.username)
        {
            message.author.send('vous ne pouvez pas écrire dans la console du bot, merci de ne plus écrire dans cette dernière.')
            Ecrire_channel('console', message.author.username + ' (' + message.member.nickname + ") a essayé d'écrire dans la console", 1)
            supprimer_message()
        }
    }


//Fonctions

function msg_tlm(msg)
{
    message.guild.members.forEach((member, key) => member.sendMessage(msg))
}

function modifier_surnom(surnom)
{
    if(is_admin() == false)
    {
        return
    }



    var ancien_surnom = message.mentions.members.first().nickname
    message.mentions.members.first().setNickname(surnom)
    message.mentions.users.first().sendMessage(message.member.nickname + ' a modifié votre surnom en ' + surnom)
    supprimer_message()
    add_console()
    Ecrire_channel('reponse-bot', message.member.nickname + ' a modifié le surnom de ' + ancien_surnom + 'en ' + surnom)
}

function avertissement(raison, niveau)
{
    message.mentions.members.first().sendMessage(message.member.nickname + " vous a donné un avertiessement, voici la raison: " + raison + ' ' + msg_niveau_avertissement[niveau])
    Ecrire_channel('avertissements', message.mentions.members.first().nickname + ' (' + message.mentions.users.first().username + ') a reçu un avertissement pour la raison suivante ' + raison + ' ' + msg_niveau_avertissement[niveau], 1)
}

function arret_bot()
{
  if (is_admin())
    {
      supprimer_message()
      Bot.destroy()//déconnecte le bot
    }
}

function msg_mention(texte)
{
    message.mentions.members.forEach( membre => {
        membre.sendMessage(texte)
    });
}

    function modifier_role(role, ajouter)
    {
        let role_add = message.guild.roles.find('name', role)
    if(ajouter)
    {
        if(role_add !== null)
        {
            message.mentions.members.first().addRole(role_add)
        }
        else
        {
            message.author.sendMessage('aucun rôle ne correspond au nom ' + role)
        }
    }
    else
    {
        if(role_add !== null)
        {
            message.mentions.members.first().removeRole(role_add)
        }
        else
        {
            message.author.sendMessage('aucun rôle ne correspond au nom ' + role)
        }
    }
        supprimer_message()
        add_console()
    }

      function is_admin()//retourne si l'utilisateur est administrateur
      {
        //return message.member.hasPermission('ADMINISTRATOR')
        if(message.member.roles.find('name', 'admin'))
        {
            return true
        }
        else
        {
            return false
        }
      }

      function add_console()//affiche dans le salon console, la commande entrée par un utilisateur
      {
          var autheur = message.author.username
        message.guild.channels.find("name", "console").send('[' + heure() + '] ' + autheur + ' (' + message.member.nickname + ') à entré cette commande: ' + message.content)
      }

      function heure()//retourne l'heure actuelle
      {
        var now = new Date();
 
        var annee   = now.getFullYear();
        var mois    = ('0'+now.getMonth()+1).slice(-2);
        var jour    = ('0'+now.getDate()   ).slice(-2);
        var heure   = ('0'+now.getHours()  ).slice(-2);
        var minute  = ('0'+now.getMinutes()).slice(-2);
        var seconde = ('0'+now.getSeconds()).slice(-2);

        return jour + '/' + mois + '/' + annee + ' | ' + heure + ':' + minute + ':' + seconde
      }

      function supprimer_message()//supprime le dernier message envoyé
      {
          if(message.deletable)
          {
              message.delete()
          }
      }

      function Ecrire_channel(nom, texte, activ_heure){//Ecris dans le channel indiqué
        if(activ_heure == 1)
        {
          message.guild.channels.find("name", nom).send('[' + heure() + '] ' + texte)
        }else{
            message.guild.channels.find("name", nom).send(texte)
        }
      }

});

