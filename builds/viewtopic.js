/* This is the javascript that generates the HTML that surrounds the posts when viewing a topic. */
/* It also handles the page views. */


// This would be defined as a constant, but it appears not all browsers support that.
var PostsPerPage = 15;


// Outputs the HTML for the body down to the beginning of the post-specific stuff.
// The second parameter identifies which forum this came from, which can affect the navigational buttons.
// Supported parameter values are:
//     "build", "general", "prcbuild", "request",
//     "30build2", "20build2", "general2", "beyond2", and "request2".
function PrintPageTop(Guild, ForumType, TopicType, TopicName, NumPosts, NumViews)
{
    // Decide which "back" link to display.
    var ForumName = ForumType + " Forum";
    var ForumFile = ForumType + "forum.html";
    if      ( ForumType == "build"    ) ForumName = "Epic Character Builds";
    else if ( ForumType == "general"  ) ForumName = "General Discussion";
    else if ( ForumType == "prcbuild" ) ForumName = "PRC Epic Character Builds";
    else if ( ForumType == "request"  ) ForumName = "Build Request Forum";
    // Part Deux:
    else if ( ForumType == "30build2" ) ForumName = "Epic Character Builds - Level 30";
    else if ( ForumType == "20build2" ) ForumName = "Epic Character Builds - Level 20";
    else if ( ForumType == "general2" ) ForumName = "General Discussion";
    else if ( ForumType == "request2" ) ForumName = "Build Request Forum";
    else if ( ForumType == "beyond2"  ) ForumName = "Beyond Obsidian";
    // Detect which guild to link back to.
    var GuildURL = "../guild.html";
    // Forum types ending in "2" indicate Part Deux. Just be careful of bad input.
    if ( ForumType.charAt  &&  ForumType.length > 0 )
        if ( ForumType.charAt(ForumType.length-1) == "2" )
            GuildURL = "../guild2.html";

    // Having this statement fail is bad for presentation, so just in case, catch exceptions.
    try { InitPage(NumPosts); } catch (e) { document.writeln('<p class="warn">Warning: an error may have ' +
                                                             'reduced functionality on this page.<br />'+e+'</p>'); }

    document.writeln('	<a name="top"></a>');
    document.writeln('	<p><a href="http://nwn.bioware.com/guilds_registry/"><img src="../../images/header_guilds.gif" height="45" border="0"');
    document.writeln('	      alt="Guilds and Registry (at BioWare)"></a></p>');
    document.writeln('	<p class="subtitle"><a href="'+GuildURL+'" class="subtitle">'+Guild+'</a>:');
    document.writeln('	                    <a href="../' + ForumFile + '" class="subsubtitle">' + ForumName + '</a></p>');
    document.writeln('	<p class="title">' + TopicName + '</p>');
    document.writeln('');
    PrintNavBox(NumPosts);
    document.writeln('	<div class="gobottom"><a href="#bottom" class="smalltext">Go To Bottom</a></div>');
    document.writeln('<table class="maintable topictable">');
    document.writeln('<tr>');
    document.writeln('	<th class="innerheader" width="20%"><strong>Author</strong></th>');
    document.writeln('	<th class="innerheader"><strong>' + TypeString(TopicType) + TopicName + '</strong></th>');
    document.writeln('</tr>');
}

// Outputs the HTML that precedes the text of each post.
function PrintPostTop(PostIndex, BioNum, Author, AuthorNum, AuthorBlurb, Timestamp)
{
    var Page = Math.floor(PostIndex/PostsPerPage)+1;
    var EvenOdd = (PostIndex-1+Page) % 2 + 1; // Start each page with an odd. E.g. page 2 starts with post index 15.

    document.writeln('<tr class="vtclass'+EvenOdd + ' page'+Page + '">');
    document.writeln('	<td><a name="' + BioNum + '"></a><span id="boldercolor"><b>' + Author + '</b></span><br />');
    document.writeln('	' + AuthorBlurb	+ '</td>');
    document.writeln('	<td><div class="cellheader"><img src="../../images/posticon.gif"><span class="postedtext">Profile: ' + Timestamp + '</span></div>');
    document.writeln('	    <div class="cellmain">');
}

// Outputs the HTML that follows the text of each post.
function PrintPostEnd(PostIndex, BioNum, Author, AuthorNum, AuthorBlurb, Timestamp)
{
    document.writeln('</div>');
    document.writeln('	    <div class="cellfooter">&nbsp;&nbsp;<a href="http://nwn.bioware.com/my_account/viewprofile.html?u='+AuthorNum+'"><img ');
    document.writeln('	        src="../../images/profile.gif" alt="Profile: '+Author+'" border="0"></a>&nbsp;&nbsp; <a ');
    document.writeln('	        href="http://nwn.bioware.com/my_account/sendmesg.html?to='+AuthorNum+'"><img ');
    document.writeln('	        src="../../images/messages.gif" alt="Send Message: '+Author+'" border="0"></a></div>');
    document.writeln('	</td>');
    document.writeln('</tr>');
}

// Outputs the HTML that follows the posts.
// The first parameter identifies which forum this came from, which can affect the navigational buttons.
// Supported parameter values are:
//     "build", "general", "prcbuild", and "request".
function PrintPageEnd(Guild, ForumType, TopicType, Build, NumPosts, NumViews)
{
    document.writeln('</table>');
    PrintNavBox(NumPosts);
    document.writeln('');
    document.writeln('	<div class="gotop"><a href="#top" class="smalltext">Go To Top</a></div>');
    document.writeln('	<a name="bottom"></a>');
}

// Outputs the HTML for the navigational box.
function PrintNavBox(NumPosts)
{
    if ( NumPosts > PostsPerPage )
    {
        var MaxPage = Math.ceil(NumPosts/PostsPerPage);

        document.write('    <div class="nav">View page: ');
        for ( Page = 1; Page < MaxPage; Page++ )
            document.write('<a href="#page'+Page+'" onclick=ViewPage('+Page+','+MaxPage+') class="notpage'+Page+'">'+Page+'</a>' +
                           '<span class="page'+Page+'">'+Page+'</span>, ');
        // The last entry does not get the trailing comma, and it closes the <div>.
        document.writeln('<a href="#page'+Page+'" onclick=ViewPage('+Page+','+MaxPage+') class="notpage'+Page+'">'+Page+'</a>'+
                         '<span class="page'+Page+'">'+Page+'</span></div>');
    }
}


function TypeString(TopicType)
{
    if ( TopicType == "N" )
        return "";
    if ( TopicType == "A" )
        return '<span class="announcement">Announcement:</span> ';
    if ( TopicType == "S" )
        return '<span class="sticky">Sticky:</span> ';
    // Unrecognized type. Bug?
    return '<span class="announcement">Unknown</span> <span class="sticky">Type</span>: ';
}


// Switches the view to the specified page.
// MaxPage tells us how many things need to be hidden.
function ViewPage(NewPage, MaxPage)
{
    var newStyle = "";

    // Safety checks
    if ( NewPage < 1 )
        NewPage = 1;
    else if ( NewPage > MaxPage )
        NewPage = MaxPage;

    // Construct a new style string to hide and show pages as appropriate.
    var Page;
    for ( Page = 1; Page <= MaxPage; Page++ )
        if ( Page == NewPage )
            newStyle += ".notpage"+Page+" { display:none }\n";
        else
            newStyle += ".page"+Page+" { display:none }\n";

    try { // Firefox, et al.
        document.getElementById("mystyle").innerHTML = newStyle;
        // (innerHTML is read-only in I.E.)
    }
    catch (e) { // Internet Explorer
        document.getElementById("mystyle").styleSheet.cssText = newStyle;
    }

    // Go to the top of the page, as if it had reloaded.
    window.scroll(0,0);
}

// Initializations for this page.
function InitPage(NumPosts)
{
    var MaxPage = Math.ceil(NumPosts/PostsPerPage);

    // Determine the page to initially show.
    var matches = /.*page=?(\d+)/.exec(document.URL);

    if ( matches  &&  matches[1] )
        ViewPage(matches[1], MaxPage);
    else if ( NumPosts > PostsPerPage ) // Minor efficiency check excluding short topics.
        ViewPage(1, MaxPage);
}

// Create an anchor element, compensating for moved links.
// FileName is, for example, "viewtopic.html".
// (Note: There is a multi-line comment within this function.)
function PrintAnchor(FileName, Guild, Forum, Topic, Start, RemainingURL, RemainingHTML)
{
    var newURL = "";

    // Only adjust links for viewing topics in Epic Character Builders Guild.
    if ( Guild == "8061" )
    {
        // How to proceed depends on which file was requested.

        if ( FileName == "viewtopic.html" )
        {
            // Determine which forum was referenced.
            var Prefix = "";
            if      ( Forum == "13422" ) Prefix = "general";
            else if ( Forum == "13423" ) Prefix = "build";
            else if ( Forum == "15436" ) Prefix = "prcbuild";
            else if ( Forum == "16203" ) Prefix = "request";

            if ( Prefix != "" )
                // Change the URL to match what we are hosting.
                newURL = Prefix + Topic + ".html" +
                         ( Start != "" ? ("&amp;page=" + (Math.floor(sp/PostsPerPage)+1)) : "" );
        }
        else if ( FileName == "viewforum.html" )
        {
            // Viewing one of the forums.
            if      ( Forum == "13422" ) newURL = "../generalforum.html";
            else if ( Forum == "13423" ) newURL = "../buildforum.html";
            else if ( Forum == "15436" ) newURL = "../prcbuildforum.html";
            else if ( Forum == "16203" ) newURL = "../requestforum.html";
        }

        else if ( FileName == "viewguild.html" )
            newURL = "../guild.html";

    }
    // OPTIONAL -- Uncomment this part if you want to use it.
    // Adjust links for viewing topics in the Epic Character Builder Part Deux guild also hosted locally.
    /*
    else if ( Guild == "14504" )
    {
        // How to proceed depends on which file was requested.
        if ( FileName == "viewtopic.html" )
        {
            // Determine which forum was referenced.
            var Prefix = "";
            if      ( Forum == "24644" ) Prefix = "general";
            else if ( Forum == "24645" ) Prefix = "20build";
            else if ( Forum == "24646" ) Prefix = "request";
            else if ( Forum == "26365" ) Prefix = "30build";
            else if ( Forum == "27287" ) Prefix = "beyond";

            if ( Prefix != "" )
                // Change the URL to match what we are hosting.
                newURL = Prefix + Topic + ".html" +
                         ( Start != "" ? ("&amp;page=" + (Math.floor(sp/PostsPerPage)+1)) : "" );
        }
        else if ( FileName == "viewforum.html" )
        {
            // Viewing one of the forums.
            if      ( Forum == "24644" ) newURL = "../general2forum.html";
            else if ( Forum == "24645" ) newURL = "../20build2forum.html";
            else if ( Forum == "24646" ) newURL = "../request2forum.html";
            else if ( Forum == "26365" ) newURL = "../30build2forum.html";
            else if ( Forum == "27287" ) newURL = "../beyond2forum.html";
        }

        else if ( FileName == "viewguild.html" )
            newURL = "../guild2.html";

    }
    */

    if ( newURL == "" )
        // We did not intercept the URL, so reconstruct (an equivalent of) the original.
        newURL = "http://nwn.bioware.com/guilds_registry/" + FileName + "?gid=" + Guild +
                 ( Forum != "" ? ("&amp;forum=" + Forum) : "" ) +
                 ( Topic != "" ? ("&amp;topic=" + Topic) : "" ) + 
                 ( Start != "" ? ("&amp;sp="    + Start) : "" );

    // Fix the remainig HTML (in some cases).
    while ( RemainingURL  &&  /[\.\?!,;:"'\)]$/.test(RemainingURL) )
        RemainingURL = RemainingURL.substring(0, RemainingURL.length-1);

    // Construct the anchor element.
    document.write('<a href="'+newURL+RemainingURL+'"' + RemainingHTML + '>');
}

