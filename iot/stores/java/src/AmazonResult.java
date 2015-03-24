public class AmazonResult {
	private String	image = null;	
	private String	title = null;
	private String	upc = null;
	
	public AmazonResult( String title, String image, String upc ) {
		setTitle( title );
		setImage( image );
		setUpc( upc );
	}
	
	public AmazonResult( String title, String image ) {
		this( title, image, null );
	}
	
	public AmazonResult( String upc ) {
		this( null, null, upc );
	}
	
	public AmazonResult() {
		this( null, null, null );
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getUpc() {
		return upc;
	}

	public void setUpc(String upc) {
		this.upc = upc;
	}
}
