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
var sondage_actif = false
var votes_multiples
//fin des variables

Bot.login('process.env.token')

Bot.on('ready', () => {

Bot.user.setPresence({ game: { name: 'BAWA Games', type: 0 } });
console.log("Bot en ligne");
Bot.channels.find("name", 'console').send('je suis en ligne')
});

Bot.on('message', message => {
    var commande = "!";
if(message.channel.name == 'commandes')
{


    if (message.content.startsWith(commande + "game")){//change le jeu du bot
        if(is_production() == false)
        {
            message.author.createDM("Vous n'as pas les droits nécessaires pour accéder à cette commande.")
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
          if(is_Director(True) == false || is_production() == false)
          {
              return
          }

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

      if (message.content.startsWith(commande + "conseil")){

        if(is_Director(true) || is_production() == false)
        {
            return
        }

          var raison_conseil = message.content.split(';')
          raison_conseil.shift()
          raison_conseil = raison_conseil.join('')

        message.guild.roles.find('name', '@production').members.forEach(membres =>{
            membres.sendMessage(message.author.username + ' (' + message.member.nickname + ") à demandé un conseil de discipline à l'encontre de " + message.mentions.members.first().user.username + ' (' + message.mentions.members.first().nickname + ') pour cette raison: ' + raison_conseil)
        });
        add_console()
        message.author.sendMessage("Vous avez demandé un conseil de discipline à l'encontre de " + message.mentions.members.first().user.username + ' (' + message.mentions.members.first().nickname + ') pour cette raison: ' + raison_conseil + '\nVotre demande à été transmise à la production, vous serez tenu au courrant de leur décision.')
    }

      if (message.content.startsWith(commande + 'surnom'))
      {
        if(is_Director(true) || is_production() == false)
        {
            return
        }

          surnom = message.content.split(';')
          surnom.shift()
          surnom = surnom.join('')
          modifier_surnom(surnom)
          add_console()
      }

      if (message.content.startsWith(commande + 'exclure.roles'))
      {
        if(is_production(True) == false)
        {
            return
        }

          Exclure_Role()
          add_console()
      }

      if (message.content.startsWith(commande + 'exclure.membre'))
      {
          if(is_production(True) == false)
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
        if(is_production(True) == false)
        {
            return
        }
        
        message.mentions.members.forEach(membre => {
            if(membre.bannable)
            {
                membre.ban()
            }
        })

        //message.mentions.members.first().ban('')
        supprimer_message()
        add_console()
    }

    if(message.content.startsWith(commande + 'radio.start'))//démarrer la radio
    {
        message.author.sendMessage("La commande !radio à été retirée du bot")
        return
        if (is_production(True) == false)
        {
            return
        }

        radio_plage = message.content.split(';')
        radio_plage.shift()
        radio_plage = radio_plage.join('')

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

    if(message.content == commande + 'radio.pause')//mettre la radio en pause
    {
        return
        if (dispatcher !== undefined)
        {
            dispatcher.pause()
        }
        add_console()
    }

    if(message.content == commande + 'radio.resume')//reprendre la radio
    {
        return
        if (dispatcher !== undefined)
        {
            dispatcher.resume()
        }
        add_console()
    }
      

    if(message.content.startsWith(commande + 'role.add'))
    {
        if(is_Director(true) || is_production() == false)
        {
            return
        }

        var role = message.content.split(';')
        role.shift()
        role = role.join()
        modifier_role(role, true)
        add_console()
    }

    if(message.content.startsWith(commande + 'role.remove'))
    {
        if(is_Director(true) || is_production() == false)
        {
            return
        }

        var role = message.content.split(';')
        role.shift()
        role = role.join()
        modifier_role(role, false)
        add_console()
    }

    if(message.content.startsWith(commande + "message.role"))
    {
        if(is_Director(true) || is_production() == false)
        {
            return
        }

        var message_role = message.content.split(';')
        message_role.shift()
        message_role = message_role.join('')
        message.mentions.roles.forEach(Roles =>{
            Roles.members.forEach(membres =>{
                membres.user.sendMessage(message.member.nickname + " vous à evoyé un message: " + message_role)
            })
        })
        add_console()
    }

    if (message.content.startsWith(commande + 'message.all'))
    {
        if(is_production(True) == false)
        {
        return
        }

        var msg = message.content.split(';')
        msg.shift()
        msg = msg.join('')
        msg_tlm(msg) 
        add_console()
    }

    if(message.content.startsWith(commande + 'role.membres'))
    {
        if(is_Director(true) || is_production() == false)
        {
            return
        }

        var role_find = message.content.split(';')
        role_find.shift()
        role_find = role_find.join('')
        Find_Member(role_find)
        add_console()
    }

    if(message.content.startsWith(commande + 'membre.roles'))
    {
        if(is_Director(true) || is_production() == false)
        {
            return
        }

        Find_Role()
        add_console()
    }

    if(message.content.startsWith(commande + 'sondage.texte'))
    {
        if(is_production(True) == false)
        {
            return
        }

        texte_sondage = message.content.split(';')
        texte_sondage.shift()
        texte_sondage = texte_sondage.join('')
        supprimer_message()
        add_console()
    }

    if(message.content.startsWith(commande + 'sondage.votes.multiples'))
    {
        if(is_production(True) == false)
        {
            return
        }

        var multiple = message.content.split(';')
        multiple.shift()
        multiple = multiple.join('')
        if(multiple == '1')
        {
            votes_multiples = true
        }
        else
        {
            votes_multiples = false
        }
        add_console()
    }

    if(message.content.startsWith(commande + 'sondage.réponses'))
    {
        if (is_production(True) == false)
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
        if (is_production(True) == false)
        {
            return
        }

        sondage_date = message.content.split(';')
        sondage_date.shift()
        sondage_date = sondage_date.join('')
        supprimer_message()
        add_console()
    }

    if(message.content.startsWith(commande + 'sondage.verif'))
    {
        if(is_production == false)
        {
            return
        }

        var test = 'texte du sondage : ' + texte_sondage + '\n'
        var response_test = reponses_sondage.toString()
        for (pas = 0; pas < reponses_sondage.length; pas++) {
            response = response_test.replace(',', ' / ')
        }
        test = test + 'réponses possibles: ' + response_test + '\n'
        test = test + 'Date limite: ' + sondage_date + '\n'
        test = test + 'votes multiples autorisés: ' + votes_multiples
        message.author.sendMessage(test)
        add_console()
    }

    if(message.content.startsWith(commande + 'sondage.poste'))
    {
        if(is_production(True) == false)
        {
            return
        }

        sondage_actif = true

        var response = reponses_sondage.toString()
        for (pas = 0; pas < reponses_sondage.length; pas++) {
            response = response.replace(',', ' / ')
        }

        var multiples

        if(votes_multiples)
        {
            multiples = 'vous pouvez voter autant de fois que vous le souhaitez'
        }
        else
        {
            multiples = "vous ne pouvez voter qu'une fois"
        }

        supprimer_message()
        add_console()

        Ecrire_channel('sondages', "Un nouveau sondage est disponible, merci d'y répondre avant le " + sondage_date + '\nVoici le sujet du sondage:\n' + texte_sondage + '\nRéponses possibles: ' + response + '\nMerci de repecter les accents, les majuscules et les minuscules.\n' + multiples + 'Merci')
        liste_votants = []
        nombre_vote = 0
    }

    if(message.content.startsWith(commande + 'sondage.stop'))
    {
        if(sondage_actif == false)
        {
            message.author.sendMessage("Aucun sondage n'est actuellement en cours, veuillez en démarrer un avant de l'arrêter.")
            return
        }

        sondage_actif = false

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

    if(message.content.startsWith(commande + 'info.membre'))
    {

        if(is_Director(true) || is_production() == false)
        {
            return
        }

        message.mentions.members.forEach(membres =>{
            var production
            var director
            if(membres.roles.find('name', 'production'))
            {
                production = 'oui'
            }
            else
            {
                production = 'non'
            }

            if(membres.roles.find('name', 'directeur'))
            {
                director = 'oui'
            }
            else
            {
                director = 'non'
            }

            message.author.sendMessage('Surnom: ' + membres.nickname +'\nPseudo: ' + membres.user.username + '\nproduction: ' + production + '\nDirecteur: ' + director)
        })
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

    if(message.content.startsWith(commande + 'appel.reunion'))
    {

        if(is_Director(true) || is_production() == false)
        {
            return
        }

        var liste_roles = new Array
        var liste_abs = new Array

        if(message.mentions.roles.first().name != 'everyone')
        {
        message.mentions.roles.forEach(role_reunion =>{
            liste_roles.push(role_reunion.members.forEach(membres =>{
                liste_roles.push(membres.nickname)
            }))
        })
        }
        else
        {
            message.guild.members.forEach(membres =>{
                liste_roles.push(membres.nickname)
            })
        }

        message.member.voiceChannel.members.forEach(membres =>{
            console.log(membres.nickname)
            var membres_presents = new Array
            if(liste_roles.indexOf(membres.nickname) != -1)
            {
                var indx = liste_roles.indexOf(membres.nickname)
                liste_roles.splice(indx, 1)
            }
        })
        var msg = 'Membres absents:'
        

        liste_roles.forEach(val =>{
            if(val == null || val == undefined)
            {

            }
            else
            {
                message.guild.members.forEach(membres =>{
                    if(liste_roles.indexOf(membres.nickname) != -1)
                    {
                        membres.user.sendMessage("Vous avez manqué une réunion, toute réunion manquée doit être justifiée. Evitez au maximum de manquer des réunions pour le bien du studio \nSi vous avez justifié voutre absance, ne tenez pas compte de ce message.")
                    }
                })
            msg = msg + ' ' + val
            }
            
        })

        message.author.sendMessage(msg)
        add_console()
    }

    if(message.content == commande + 'inviter.all')
    {
        if(message.member.voiceChannel)
        {
        msg_tlm(message.member.nickname + ' vous invite à rejoindre le channel ' + message.member.voiceChannel.name + ' vous pouvez le rejoindre quand vous voulez :wink:')
        message.member.voiceChannel()
        supprimer_message()
        add_console()
        }
        else
        {
            message.author.sendMessage('Vous devez rejoindre un salon vocal pour inviter des gens')
        }
    }

    if(message.content.startsWith(commande + 'surnom.supprimer'))
    {
        supprimer_surnom()
        add_console()
    }

    }//fin des commandes


    if(message.channel.name == 'sondages')
    {

        if(message.author.username == 'BAWA Assistance')
        {
            return
        }

        if(liste_votants.indexOf(message.author.username) !== -1 && votes_multiples == false)
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

function is_Director(msg)
{
    if( typeof(msg) == 'undefined' ){
        msg = false;
    }
     
    if(message.member.roles.find('name', 'directeur'))
    {
        return true
    }
    else
    {
        if(msg)
        {
            message.guild.roles.find('name', 'production').members.forEach(membres =>{
                membres.user.sendMessage(nom() + " à essayé d'entré une commande qui ne lui est pas autorisé. Il à essayé d'entrer cette commande: " + message.content)
            })
        }
        return false
    }
}

function msg_tlm(msg)
{
    message.guild.members.forEach((member, key) => member.sendMessage(msg))
}

function modifier_surnom(surnom)
{
    if(is_production(True) == false)
    {
        return
    }

    try
    {

        message.mentions.members.forEach(membre => {
            
            var ancien_surnom = membre.nickname
            membre.setNickname(surnom)
            membre.user.sendMessage(message.member.nickname + ' a modifié votre surnom en ' + surnom)
            Ecrire_channel('reponse-bot',  + nom() + ' a modifié le surnom de ' + ancien_surnom + 'en ' + surnom)
        })
    }
    catch
    {
        message.author.sendMessage('Le surnom de ' + surnom + " n'à pu être modifié, vérifiez que vous avez correctement rédigé la commande.")
    }

    supprimer_message()
    add_console()
}

function supprimer_surnom(surnom)
{
    if(is_production(True) == false)
    {
        return
    }

    try
    {

        message.mentions.members.forEach(membre => {
            membre.setNickname(null)
            membre.user.sendMessage(message.member.nickname + ' a modifié votre surnom en ' + surnom)
            Ecrire_channel('reponse-bot',  + nom() + ' a supprimé le surnom de ' + membre.user.username)
        })
    }
    catch
    {
        message.author.sendMessage("Impossible de supprimer les surnoms de ces personnes.")
    }

    supprimer_message()
    add_console()
}

function Exclure_Role()
{
    var tableau = message.content.split(';')
    tableau.shift()

    tableau.forEach(tab => {
        message.guild.roles.find('name', tab).members.forEach(membres => {
            if (membres.kickable)
            {
            membres.kick()
            }
        })
    })
}

function Ban_Role()
{
    var tableau = message.content.split(';')
    tableau.shift()

    tableau.forEach(tab => {
        message.guild.roles.find('name', tab).members.forEach(membres => {
            if (membres.bannable)
            {
            membres.ban()
            }
        })
    })
}

function Find_Role()
{
    message.mentions.members.forEach(membres => {
        var roles_mbr = ""

        membres.roles.forEach(role_membre => {
            roles_mbr = roles_mbr + role_membre.name + '\n'
        })

        message.author.sendMessage('Roles de ' + membres.user.username + ' (' + membres.nickname + ') : \n' + roles_mbr)
    });
}

function Find_Member(role_membre)
{
    try{
    var tab_membres = ['']
    message.guild.roles.find('name', role_membre).members.forEach(membres => {
        tab_membres.push(membres.user.username + ' (' + membres.nickname + ')')
    })
    var membres_role = ''
    for (pas = 1; pas < tab_membres.length; pas++) {
        membres_role = membres_role + tab_membres[pas] + '\n'
    }

    try
    {
        var role1 = membres_role[1]
    }
    catch
    {
        membres_role = 'Aucun membre ne possède ce rôle'
    }

    if(role1 == undefined)
    {
        membres_role = 'Aucun membre ne possède ce rôle'
    }

    message.author.sendMessage('Voici les membres possédant ce rôle: \n' + membres_role)
}
catch
{
    message.author.sendMessage("Vous avez entré une commande érronée, vérifiez que vous n'avez pas entré : au lieu de ; ou que le rôle que vous avez entré existe bien.")
}
}

function avertissement(raison, niveau)
{
    message.mentions.members.first().sendMessage(message.member.nickname + " vous a donné un avertiessement, voici la raison: " + raison + ' ' + msg_niveau_avertissement[niveau])
    Ecrire_channel('avertissements', message.mentions.members.first().nickname + ' (' + message.mentions.users.first().username + ') a reçu un avertissement pour la raison suivante ' + raison + ' ' + msg_niveau_avertissement[niveau], 1)
}

function arret_bot()
{
  if (is_production(True))
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
        if(role_add == null)
        {
            message.author.sendMessage('Le rôle que vous avez spécifié est introuvable, vérifiez que vous avez correctement entré le nom du rôle ou que vous avez correctement entré la commande (' + commande + 'role.add (mentionnez toutes les personnes qui recevront ce role);(role à ajouter)')
            return
        }

    if(ajouter)
    {
        try{
            message.mentions.members.forEach(mention => {
                mention.addRole(role_add)
                Ecrire_channel('reponse-bot', "Un role à été ajouté\nIdentifiant de l'éditeur: " + message.author.username + "\nSurnom de l'éditeur: " + message.member.nickname + "\n----------\nIdentifiant du client: " + mention.user.username + "\nSurnom du client: " + mention.nickname + "\nRole ajouté: " + role + "\n--------------------")
            })
        }
        catch{
            message.author.sendMessage('Le rôle que vous avez spécifié est introuvable, vérifiez que vous avez correctement entré le nom du rôle ou que vous avez correctement entré la commande (' + commande + 'role.add (mentionnez toutes les personnes qui recevront ce role);(role à ajouter)')
        }
    }
    else
    {
        try{
            message.mentions.members.forEach(mention => {
                mention.removeRole(role_add)
                Ecrire_channel('reponse-bot', "Un role à été retiré\nIdentifiant de l'éditeur: " + message.author.username + "\nSurnom de l'éditeur: " + message.member.nickname + "\n----------\nIdentifiant du client: " + mention.user.username + "\nSurnom du client: " + mention.nickname + "\nRole ajouté: " + role + "\n--------------------")
            })
        }
        catch{
            message.author.sendMessage('Le rôle que vous avez spécifié est introuvable, vérifiez que vous avez correctement entré le nom du rôle ou que vous avez correctement entré la commande (' + commande + 'role.add (mentionnez toutes les personnes qui recevront ce role);(role à ajouter)')
        }
    }
        supprimer_message()
        add_console()
    }

      function is_production(msg)//retourne si l'utilisateur est administrateur
      {
        //return message.member.hasPermission('ADMINISTRATOR')
        if( typeof(msg) == 'undefined' ){
            msg = false;
        }
         
        if(message.member.roles.find('name', 'production'))
        {
            return true
        }
        else
        {
            if(msg)
            {
                message.guild.roles.find('name', 'production').members.forEach(membres =>{
                    membres.user.sendMessage(nom() + " à essayé d'entré une commande qui ne lui est pas autorisé. Il à essayé d'entrer cette commande: " + message.content)
                })
            }
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

      function nom()
      {
        var nom
        if(message.member.nickname == null)
        {
            nom = message.author.username
        }
        else
        {
            nom = message.author.username + '(' + message.member.nickname + ')'
        }

        return nom
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
