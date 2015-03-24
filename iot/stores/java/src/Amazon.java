import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.SortedMap;
import java.util.TimeZone;
import java.util.TreeMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.commons.codec.binary.Base64;
import org.w3c.dom.Document;
import org.w3c.dom.Node;

public class Amazon {

	private static final String HMAC_SHA256 = "HmacSHA256";	
	private static final String KEY_FILE = "amazon.txt";
	private static final String NEWLINE = "\n";	
	private static final String REQUEST_ENDPOINT = "webservices.amazon.com";	
	private static final String REQUEST_METHOD = "GET";	
	private static final String REQUEST_URI = "/onca/xml";	
	
	private AmazonResult	scan = null;
	
	private Mac				mac = null;	
	private SecretKeySpec	secretSpec = null;
	
	private String accessKey = null;
	private String associateTag = null;
	private String secretKey = null;
	
	public AmazonListener	callback = null;
	
	public Amazon() {
		loadKeys();
	}
	
	private String canonicalize( SortedMap<String, String> map ) {
		Iterator<Map.Entry<String, String>>	iterator;
		Map.Entry<String, String>			pair;
		StringBuffer						buffer;
		
        if( map.isEmpty() ) {
            return "";
        }

        buffer = new StringBuffer();
        iterator = map.entrySet().iterator();

        while( iterator.hasNext() ) {
            pair = iterator.next();
            
            buffer.append( percentEncodeRfc3986( pair.getKey() ) );
            buffer.append( "=" );
            buffer.append( percentEncodeRfc3986( pair.getValue() ) );
            
            if( iterator.hasNext() ) {
                buffer.append( "&" );
            }
        }
        
        return buffer.toString();
    }	
	
	private String getHmac( String sign ) {
		Base64	encoder;
        byte[]	data;
        byte[]	raw;		
        String	signature;

        try {
            data = sign.getBytes( StandardCharsets.UTF_8.name() );
            raw = mac.doFinal( data );
            
            encoder = new Base64();
            signature = new String( encoder.encode( raw ) );
        } catch( UnsupportedEncodingException uee ) {
            throw new RuntimeException( StandardCharsets.UTF_8.name() + " is unsupported!", uee );
        }
        
        return signature;
    }	
	
	private void fetch( String request ) {
		Document				document;
		DocumentBuilder			builder;		
		DocumentBuilderFactory	factory;
		Node					image;
        
        try {
            factory = DocumentBuilderFactory.newInstance();
            builder = factory.newDocumentBuilder();
            document = builder.parse( request );
            
            scan.setTitle( document.getElementsByTagName( "Title" ).item( 0 ).getTextContent() );
            
            image = document.getElementsByTagName( "LargeImage" ).item( 0 );
            scan.setImage( image.getFirstChild().getTextContent() );
        } catch( Exception e ) {
            e.printStackTrace();
        }
        
        if( callback != null ) {
        	callback.onResult( scan );
        }
    }	
	
	private void loadKeys() {
		byte[]			data;
		byte[]			keyBytes;
		File 			file;
		FileInputStream	stream;
		String			keys;
		String[] 		parts;
		
		try {
			// Read key file
			file = new File( KEY_FILE );			
			stream = new FileInputStream( file );
			data = new byte[( int )file.length()];
			stream.read( data );
			stream.close();
			
			// Parse keys
			keys = new String( data, StandardCharsets.UTF_8 );
			parts = keys.split( NEWLINE );
			accessKey = parts[0];
			secretKey = parts[1];
			associateTag = parts[2];
			
			// Setup security
			keyBytes = secretKey.getBytes( StandardCharsets.UTF_8 );
			secretSpec = new SecretKeySpec( keyBytes, HMAC_SHA256 );
			
			try {
				mac = Mac.getInstance( HMAC_SHA256 );
				mac.init( secretSpec );
			} catch( NoSuchAlgorithmException nsae ) {
				nsae.printStackTrace();
			} catch( InvalidKeyException ike ) {
				ike.printStackTrace();
			}
		} catch( UnsupportedEncodingException uee ) {
			uee.printStackTrace();
		} catch( IOException ioe ) {
			ioe.printStackTrace();
		}		
	}
	
	// Per Amazon
	private String percentEncodeRfc3986( String s ) {
        String	result;
        
        try {
            result = URLEncoder.encode( s, StandardCharsets.UTF_8.name() )
            	.replace( "+", "%20" )
                .replace( "*", "%2A" )
                .replace( "%7E", "~" );
        } catch( UnsupportedEncodingException uee ) {
            result = s;
        }
        
        return result;
    }	
	
	public void search( String upc ) {
		Map<String, String>	params;
		String				request;

		scan = new AmazonResult( upc );
		
        params = new HashMap<String, String>();
        params.put( "Service", "AWSECommerceService" );
        params.put( "Version", "2013-08-01" );
        params.put( "Operation", "ItemLookup" );
        params.put( "ItemId", upc );
        params.put( "IdType", "UPC" );
        params.put( "SearchIndex", "All" ); 
        params.put( "ResponseGroup", "Small, Images" );
        params.put( "AssociateTag", associateTag );
        
        request = sign( params );
        
        // System.out.println( "Signed Request is \"" + request + "\"" );
        
        fetch( request );
	}
	
	private String sign( Map<String, String> params ) {
		SortedMap<String, String>	map;
		String						canonical;
		String						hmac;
		String						sign;
		String						signature;
		
		// Add additional parameters
        params.put( "AWSAccessKeyId", accessKey );
        params.put( "Timestamp", timestamp() );

        // Lexicographical order
        map = new TreeMap<String, String>( params );
        
        // Canonical form
        canonical = canonicalize( map );
        
        // Signature string 
        sign = REQUEST_METHOD + "\n" + 
        	REQUEST_ENDPOINT + "\n" +
            REQUEST_URI + "\n" +
            canonical;

        // Get signature
        hmac = getHmac( sign );
        signature = percentEncodeRfc3986( hmac );

        // Construct URL
        return "http://" + REQUEST_ENDPOINT + REQUEST_URI + "?" + canonical + "&Signature=" + signature;
    }	
	
	private String timestamp() {
		Calendar	cal;
		DateFormat	format;

		cal = Calendar.getInstance();
		format = new SimpleDateFormat( "yyyy-MM-dd'T'HH:mm:ss'Z'" );
		format.setTimeZone( TimeZone.getTimeZone( "GMT" ) );
		
		return format.format( cal.getTime() );
    }	
	
}
