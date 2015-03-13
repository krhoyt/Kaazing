import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonWriter;

public class Parse {
	
	private static final String	PARSE_API = "parse.txt";
	private static final String	PARSE_SEPARATOR = "\n";
	private static final String	PARSE_URL = "https://api.parse.com/1/classes/Iot";
	
	private String	application = null;
	private String	rest = null;
	private URL 	url = null;
	
	public Parse() {
		byte[]			data;
		File 			file;
		FileInputStream	stream;
		String			content;
		String[]		parts;
		
		try {
			file = new File( PARSE_API );			
			stream = new FileInputStream( file );
			data = new byte[( int )file.length()];
			stream.read( data );
			stream.close();
			
			content = new String( data, "UTF-8" );
			parts = content.split( PARSE_SEPARATOR );
			
			application = parts[0];
			rest = parts[1];
		} catch( UnsupportedEncodingException uee ) {
			uee.printStackTrace();
		} catch( IOException ioe ) {
			ioe.printStackTrace();
		}		
		
		if( application != null ) {
			initConnection();
		}
	}
	
	private void initConnection() {
		try {
			url = new URL( PARSE_URL );	
		} catch( MalformedURLException mue ) {
			mue.printStackTrace();
		}		
	}
	
	public String save( String data ) {
		HttpURLConnection	connection;
		JsonObject			request;
		JsonObjectBuilder	builder;
		Reader				response;
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
		
		try {
	        connection = ( HttpURLConnection )url.openConnection();
	        connection.setRequestMethod( "POST" );
	        connection.setRequestProperty( "Content-Type", "application/json" );
	        connection.setRequestProperty( "Content-Length", String.valueOf( sw.toString().length() ) );        
	        connection.setRequestProperty( "X-Parse-Application-Id", application );        
	        connection.setRequestProperty( "X-Parse-REST-API-Key", rest );        
	        connection.setDoOutput( true );
	        connection.getOutputStream().write( sw.toString().getBytes() );
	        
	        response = new BufferedReader( new InputStreamReader( connection.getInputStream(), "UTF-8" ) );
	        
	        // TODO: Make into string to return
	        for( int c = 0; ( c = response.read() ) >= 0; System.out.print( ( char )c ) );
		} catch( IOException ioe ) {
			ioe.printStackTrace();
		}
		
		return "Saved.";
	}
	
}
