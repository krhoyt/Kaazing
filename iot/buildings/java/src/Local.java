import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;

public class Local {

	private static final String	LOCAL_LOG = "../web/local.txt";
	
	public LocalListener	callback = null;	

	public String save( String data ) {
		BufferedWriter		bw;
		FileWriter			fw;
		JsonObject			request;
		JsonObjectBuilder	builder;
		PrintWriter			out;
		StringBuilder		result;
		String[]			parts;
		StringWriter		sw;
		
		parts = data.split( "," );
		
		builder = Json.createObjectBuilder();
		builder.add( "usage", Float.valueOf( parts[0] ) );
		builder.add( "index", Float.valueOf( parts[1] ) );
		builder.add( "comfort", Float.valueOf( parts[2] ) );
		
		request = builder.build();
		
		sw = new StringWriter();
		
		try( JsonWriter writer = Json.createWriter( sw ) ) {
			writer.writeObject( request );
		}		
        
		// Log to recording file
		// Future playback without car
		try {
			fw = new FileWriter( LOCAL_LOG );
			bw = new BufferedWriter( fw );
		    
			out = new PrintWriter( bw );
		    out.print( sw.toString().trim() );
		    out.close();
		    
	        if( callback != null ) {
	        	callback.onSave( sw.toString().trim() );
	        }		    
		} catch( IOException ioe ) {
			ioe.printStackTrace();
		}				
        
		return sw.toString().trim();        
	}
	
}
