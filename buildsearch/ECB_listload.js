// Function that converts our build list from CSV.
// Assumes the folowing have been defined (see e.g. ECB_config.js):
//     NUM_CLASSES
//     BadLowerCase
//     NonLowerCase


// The text format of the CSV is one line per build, each line in the form
//     {topic number}: {author}: {race}: {classes}: {name}
// Any colons in "author" or "name" will be converted to ":;" to avoid ambiguity.
// The "classes" are in the format
//     {class} {level}[/ {class} {level}[/ {class} {level}[/ {class} {level}]]]

// The list format is an array of objects with the properties:
//     author
//     race
//     class1, class2, class3, class4
//     level1, level2, level3, level4
//     description
//     topicNum


// Returns the characters up to the first digit in data_string.
// Returns "" on error.
function GetToNumber(data_string)
{
    // Safety check.
    if ( !data_string )
    return "";

    // Peel off up to the first digit (or minus sign).
    var data_array = /^[^0-9\-]*/.exec(data_string);
    if ( data_array  &&  data_array.length > 0 )
        return data_array[0];

    return "";
}


// Returns the first sequence of digits in data_string.
// Returns "0" on error.
function GetFirstNumber(data_string)
{
    // Safety check.
    if ( !data_string )
    return "0";

    // Peel off up to the first digit (or minus sign).
    var data_array = /[0-9\-]+/.exec(data_string);
    if ( data_array  &&  data_array.length > 0 )
        return data_array[0];

    return "0";
}


// Creates a list of builds based on source_text.
function LoadList(source_text)
{
    var build_list = new Array();
    var line_split = null;
    var line_object = null;

    // Safety check
    if ( !source_text )
        return build_list;  // A 0-length array.

    // Split the input into lines.
    var source_lines = source_text.split( /\r(?!\n)|\r?\n/ );

    // Iterate through the lines.
    // Line 0 is to be skipped.
    var line_index = 0;
    while ( ++line_index < source_lines.length )
    {
        // Parse the input text.
        line_split = source_lines[line_index].split( /:(?!;)/ );

        // Check that this appears to be valid input.
        if ( 4 < line_split.length )
        {
            // Convert the parsed text to object properties.
            line_object = new Object();
            line_object.topicNum    = line_split.shift();
            line_object.author      = line_split.shift();
            line_object.race        = line_split.shift();
            line_object.class1      = line_split.shift();   // To be parsed later.
            line_object.description = line_split.join(":"); // In case someone added ": " in a description.

            // Restore colons.
            line_object.author = line_object.author.replace(/:;/g, ":");
            line_object.description = line_object.description.replace(/:;/g, ":");

            // Parse the class list.
            line_split = line_object.class1.split( "/" );
            for ( var i=1; i <= NUM_CLASSES; i++ )
            {
                line_object["class"+i] = GetToNumber(line_split[i-1]);
                line_object["level"+i] = GetFirstNumber(line_split[i-1]);
            }

            // Trim excess leading spaces. (Want to handle this in case of human editing.)
            line_object.topicNum    = line_object.topicNum.replace( /^\s*/, "");
            line_object.author      = line_object.author.replace( /^\s*/, "");
            line_object.race        = line_object.race.replace( /^\s*/, "");
            line_object.description = line_object.description.replace( /^\s*/, "");
            for ( var i=1; i <= NUM_CLASSES; i++ )
                line_object["class"+i] = line_object["class"+i].replace( /^\s*/, "");

            // Trim excess trailing spaces. (Want to handle this in case of human editing.)
            line_object.topicNum    = line_object.topicNum.replace( /\s*$/, "");
            line_object.author      = line_object.author.replace( /\s*$/, "");
            line_object.race        = line_object.race.replace( /\s*$/, "");
            line_object.description = line_object.description.replace( /\s*$/, "");
            for ( var i=1; i <= NUM_CLASSES; i++ )
                line_object["class"+i] = line_object["class"+i].replace( /\s*$/, "");

            // Ensure case where it matters. (Want to handle this in case of human editing.)
            line_object.race = line_object.race.toLowerCase();
            for ( var i=1; i <= NUM_CLASSES; i++ )
                line_object["class"+i] = line_object["class"+i].toLowerCase();
            // Some exceptions that should have a few upper case letters.
            for ( var i=1; i <= NUM_CLASSES; i++ )
                for ( var j=NonLowerCase.length-1; j >= 0; j-- )
                    if ( line_object["class"+i] == BadLowerCase[j] )
                        line_object["class"+i] = NonLowerCase[j];
            // Add the object to the list.
            build_list.push(line_object);
        }//if
    }//while

    return build_list;
}
