require 'json'

class Session

  def initialize(req)
    if req.cookies['_rails_lite_app']
      @cookie_hash = JSON.parse(req.cookies['_rails_lite_app'])
    else
      @cookie_hash = {}
    end
  end


  def [](key)
    @cookie_hash[key]
  end

  def []=(key, val)
    @cookie_hash[key] = val
  end

  def store_session(res)
    res.set_cookie('_rails_lite_app' , @cookie_hash.to_json)
  end
end
