/**
 * Prevent Reset Sizing
 *
 * Plugin to prevent CKEditor's Image plugin setting the image width and height
 * and thereby cripling the responsive class functionality
 *
 * @author Elze Kool <info@kooldevelopment.nl>
 * @licence CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)
 * @copyright Copyright Elze Kool, 2015
 *
 **/
 ;(function(undefined) {

    /**
     * Find onChange event to replace
     **/
    var findOnChangeToReplace = function(editor, dialogName, definition, elements, parent_path)
    {
        var element,
            path;

        // If dialog doesn't have any elements skip it
        if ( !elements || !elements.length ) {
            return;
        }

        // Go trough elements
        for( var i = elements.length; i--; ) {
        
            element = elements[ i ];
            path = element.id ? (parent_path + ':' + element.id) : parent_path;
            
            // Go deeper if layout element
            if (element.type == 'hbox' || element.type == 'vbox' || element.type == 'fieldset') {
                findOnChangeToReplace( editor, dialogName, definition, element.children, path );
            }
            
            // Check if we have the correct field
            if (path !== 'info:txtUrl' || element.type !== 'text' || element.onChange === undefined) {
                continue;
            }
            
            // Replace the onChange function
            var orgOnChange = element.onChange;
            element.onChange = function() {
            
                // Set the internaly used flag dontResetSize
                // normaly this is reset to false after updating
                this.getDialog().dontResetSize = true;
                
                // Apply the normal function
                orgOnChange.apply(this);    
        
            }
            
        }    
    }

    // Init plugin
    CKEDITOR.plugins.add( 'no_image_size_reset', {
        init: function(editor) {
        }
    });

    // Add dialogDefinition observer to CKEditor
    CKEDITOR.on( 'dialogDefinition', function(e) {    
    
        var definition = e.data.definition,
            name = e.data.name,
            element;
            
        // Check if image plugin is enabled, if not we don't
        // have anything to do
        if ( !e.editor.plugins.image )
            return;

        // Check if we are dealing with image dialog
        if (name !== 'image' || definition.dialog.dontResetSize !== undefined) {
            return;
        }
        
        // Start scan for definitions
        for ( var i = 0; i < definition.contents.length; ++i ) {
            if ((element = definition.contents[i])) {
                if (element.id === 'info') {            
                    findOnChangeToReplace( e.editor, e.data.name, definition, element.elements, 'info' );
                }
            }
        }

    });

})();